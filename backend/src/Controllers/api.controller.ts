import fs from 'fs';
import path from 'path';
import axios from 'axios';
import express from 'express';
import archiver from 'archiver';
import { IncomingForm } from 'formidable';
import SlackBot from '../Models/slackbot.model';
import { UploadedFile, ParsedFile } from '../types/file';
import { getParameterValue } from '../Config/awsParams.config';
import { readUser, writeUploadedFileReference, readAllUploadedFileReferencesBySession, paginateSlackPrivateUrls, anonymizeUploadedFileReferences } from '../Utils/db.util';

interface FormFields {
  channel: string[];
  userID: string[];
  sessionID: string[];
  comment: string[];
  messageBatchSize: string[];
}

export const api = async (request: express.Request, response: express.Response) => {
  response.status(400).send('Something went wrong, you should not be here!');
}

export const getChannels = async (request: express.Request, response: express.Response) => {

  if (!request.userId) {
    return response.status(400).send('UserID is required');
  }

  const user = await readUser(request.user as string);
  const slackAccessToken = await getParameterValue(`SLA_IDAU${user.userData.authedUser?.id}IDT${user.userData.team?.id}`);

  try {
      const slackbot = new SlackBot('', slackAccessToken);
      const channels = await slackbot.getChannels();
      response.status(200).json(channels);
  } catch (error) {
      console.error(`Error fetching channels: ${error}`);
      response.status(500).json({ error: 'Failed to retrieve channels' });
  }
};

export const getImagesUrls = async (request: express.Request, response: express.Response) => {

  const { page = '1', limit = '10' } = request.query as { page: string, limit: string };
  const pageNumber = parseInt(page, 10);
  const limitNumber = parseInt(limit, 10);

  if (!request.userId) {
    return response.status(400).send('UserID is required');
  }

  const fileReferences = await paginateSlackPrivateUrls(request.userId as string, pageNumber, limitNumber);
  
  if (!fileReferences.length) {
    return response.status(404).send('No file URLs found');
  }

  const urls = fileReferences
    .filter(fileReference => fileReference.slackPrivateFileURL && fileReference.slackPrivateFileURL !== '' && fileReference.slackFileID && fileReference.slackFileID !== '')
    .map(fileReference => ({
      url: fileReference.slackPrivateFileURL,
      name: fileReference.name,
      fileID: fileReference.slackFileID,
    }));
  response.json(urls);
};

export const getImagesProxy = async (request: express.Request, response: express.Response) => {

  const { imageUrl } = request.query;
  
  if (!imageUrl) {
    return response.status(400).send('Image URL is required');
  }

  if (!request.userId) {
    return response.status(400).send('UserID is required');
  }

  try {
    const user = await readUser(request.user as string);
    const slackAccessToken = await getParameterValue(`SLA_IDAU${user.userData.authedUser?.id}IDT${user.userData.team?.id}`);

    const axiosResponse = await axios.get(decodeURIComponent(imageUrl.toString()), {
      responseType: 'stream',
      headers: {
        Authorization: `Bearer ${slackAccessToken}`,
      },
    });

    axiosResponse.headers['content-type'] = 'image/jpg';
    axiosResponse.headers['cross-origin-resource-policy'] = 'cross-origin';

    axiosResponse.data.pipe(response);
  } catch (error) {
    console.error('Error fetching image:', error);
    response.status(500).send('Error fetching image');
  }
};

export const uploadFiles = async (request: express.Request, response: express.Response) => {
  // Files are uploaded to my server in batches. This function takes the files,
  // formats the metadata, and writes the metadata to the database with a reference
  // to the file path on the server. 

  const form = new IncomingForm() as any;
  const uploadDirPath = path.join(__dirname, '../../uploads');

  if (!fs.existsSync(uploadDirPath)) {
    fs.mkdirSync(uploadDirPath);
  }
  form.uploadDir = uploadDirPath;
  form.keepExtensions = true;
  form.options.maxFileSize = 2000 * 1024 * 1024;
  form.options.maxTotalFileSize = 2000 * 1024 * 1024;

  form.parse(request, async (err: Error, fields: FormFields, files: { [key: string]: UploadedFile }) => {
    if (err) {
      console.error(`Error processing upload: ${err}`);
      return response.status(500).json({ error: 'Error processing upload' });
    }

    if (!Array.isArray(files.files)) {
      return response.status(400).send('Invalid files format.');
    }
  
    try {
      if (!request.userId) {
        return response.status(400).send('UserID is required');
      }
      
      const parsedFiles: ParsedFile[] = files.files.map((file: UploadedFile) => ({
        name: file.originalFilename,
        path: file.filepath,
        size: file.size,
        sessionID: fields.sessionID[0], // is returned as array, so access the first element
        userID: request.userId as string,
        type: file.mimetype,
        lastModifiedDate: file.lastModifiedDate,
        isUploaded: false
      }));

      await Promise.all(parsedFiles.map(file => writeUploadedFileReference(file)));
      response.status(200).json({ message: 'Files processed successfully' });

    } catch (error) {
      console.error(`Error uploading files: ${error}`);
      response.status(500).json({ error: 'Internal Server Error' });
    }
  });
};

export const uploadFinalFiles = async (request: express.Request, response: express.Response) => {
  // This function is similar to the one above. The differences are that 1.) in this function, the user's
  // info is used to get their Slack access token, and 2.) it then gets all the file references from the database
  // which are then passed to the slackbot to be uploaded to the specified channel.

  const form = new IncomingForm() as any;

  form.multiples = true;

  const uploadDirPath = path.join(__dirname, '../../uploads');
  if (!fs.existsSync(uploadDirPath)) {
    fs.mkdirSync(uploadDirPath);
  }
  form.uploadDir = uploadDirPath;
  form.keepExtensions = true;
  form.options.maxFileSize = 2000 * 1024 * 1024;
  form.options.maxTotalFileSize = 2000 * 1024 * 1024;

  form.parse(request, async (err: Error, fields: FormFields, files: { [key: string]: UploadedFile }) => {

    if (Object.keys(fields).length === 0 && Object.keys(files).length === 0) {
      return response.status(404).send('No fields or files found');
    }

    if (err) {
      console.error(`Error processing upload: ${err}`);
      return response.status(500).json({ error: 'Error processing upload' });
    }

    async function deleteFile(file: ParsedFile): Promise<void> {
      if (!file.path) {
        console.error(`No file path provided for file: ${file.name}`);
        return;
      }
      console.log(`Attempting to delete file: ${file.path}`);
      try {
        await fs.promises.unlink(file.path);
        console.log(`Successfully deleted file ${file.path}`);
      } catch (unlinkErr) {
        console.error(`Error deleting file ${file.path}: ${unlinkErr}`);
      }
    }

    try {
      const user = await readUser(request.user as string);
      const slackAccessToken = await getParameterValue(`SLA_IDAU${user.userData.authedUser?.id}IDT${user.userData.team?.id}`);
      const slackbot = new SlackBot(fields.channel[0], slackAccessToken);

      if (!Array.isArray(files.files)) {
        return response.status(400).send('Invalid files format.');
      }

      if (!request.userId) {
        return response.status(400).send('UserID is required');
      }
      
      const parsedFiles: ParsedFile[] = files.files.map((file: UploadedFile) => ({
        name: file.originalFilename,
        path: file.filepath,
        size: file.size,
        sessionID: fields.sessionID[0], // is returned as array, so access the first element
        userID: request.userId as string,
        type: file.mimetype,
        lastModifiedDate: file.lastModifiedDate,
        isUploaded: false
      }));
  
      if (parsedFiles.length === 0) {
        return response.status(400).send('No files to upload.');
      }

      await Promise.all(parsedFiles.map(file => writeUploadedFileReference(file)));
      const filesToUpload = await readAllUploadedFileReferencesBySession(fields.sessionID[0]);
      const processedFiles = await slackbot.batchAndUploadFiles(filesToUpload, request.userId ?? '', fields.sessionID[0], parseInt(fields.messageBatchSize[0]), fields.comment[0]);
      await Promise.all(processedFiles.map(file => deleteFile(file)));
      response.status(200).json({ message: 'Final files uploaded successfully!' });
    } catch (error) {
      console.trace(`Error uploading files: ${error}`);
      response.status(500).json({ error: 'Internal Server Error' });
    }
  });
}

export const deleteFiles = async (request: express.Request, response: express.Response) => {
  if (!request.userId) {
    return response.status(400).send('UserID is required');
  }

  const files = request.body.files as { id: string; deleteFlag: string; }[];

  if (!files || !Array.isArray(files) || files.length === 0) {
    console.log('Invalid file data');
    return response.status(400).send('Invalid file data');
  }

  try {
    const user = await readUser(request.user as string);
    if (!user) {
      return response.status(404).send('User not found');
    }

    const slackAccessToken = await getParameterValue(`SLA_IDAU${user.userData.authedUser?.id}IDT${user.userData.team?.id}`);
    if (!slackAccessToken) {
      return response.status(500).send('Failed to retrieve Slack access token');
    }

    const slackbot = new SlackBot('', slackAccessToken);
    const fileIDs = files.map(file => file.id);

    const deleteFromSlack = async () => await slackbot.deleteFilesFromSlack(fileIDs);
    const deleteFromApp = async () => await anonymizeUploadedFileReferences(request.userId as string, fileIDs);

    switch (files[0].deleteFlag) {
      case 'slack':
        await deleteFromSlack();
        response.status(200).json({ message: `${files.length} files deleted from Slack successfully.` });
        break;
      case 'app':
        const deletedFromApp = await deleteFromApp();
        response.status(200).json({ message: `${deletedFromApp} files deleted from Slackshots successfully.` });
        break;
      case 'both':
        await deleteFromSlack();
        const deletedFromBoth = await deleteFromApp();
        response.status(200).json({ message: `${deletedFromBoth} files deleted from both Slack and Slackshots successfully.` });
        break;
      default:
        console.log('Invalid delete flag');
        return response.status(400).send('Invalid delete flag');
    }
  } catch (error) {
    console.error(`Error deleting files: ${error}`);
    response.status(500).json({ error: 'Internal Server Error' });
  }
};

export const downloadFiles = async (request: express.Request, response: express.Response) => {

  console.log('Downloading files request received');

  if (!request.userId) {
    console.log('UserID is required');
    return response.status(400).send('UserID is required');
  }

  const files = request.body.files as { url: string; name: string }[];

  if (!files || !Array.isArray(files) || files.length === 0) {
    console.log('Invalid file data');
    return response.status(400).send('Invalid file data');
  }

  try {
    const user = await readUser(request.user as string);
    const slackAccessToken = await getParameterValue(`SLA_IDAU${user.userData.authedUser?.id}IDT${user.userData.team?.id}`);

    const zip = archiver('zip', {
      zlib: { level: 9 }
    });

    response.setHeader('Content-Type', 'application/zip');
    response.setHeader('Content-Disposition', `attachment; filename=slack_files.zip`);

    zip.pipe(response);

    for (const file of files) {
      try {
        console.log(`Processing file: ${file.name}`);
        const fileResponse = await axios.get(decodeURIComponent(file.url.toString()), {
          responseType: 'stream',
          headers: {
            Authorization: `Bearer ${slackAccessToken}`,
          },
        });

        if (!fileResponse.data) {
          console.error(`Failed to fetch file: ${file.url}`);
          continue;
        }

        zip.append(fileResponse.data, { name: file.name });
        console.log(`File processed: ${file.name}`);
      } catch (error) {
        console.error(`Error processing file ${file.name}:`, error);
      }
    }

    await zip.finalize();

  } catch (error) {
    console.error(`Error downloading files: ${error}`);
    response.status(500).json({ error: 'Internal Server Error' });
  }
};