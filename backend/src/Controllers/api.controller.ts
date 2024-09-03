import fs from 'fs';
import path from 'path';
import express from 'express';
import SlackBot from '../Models/slackbot.model';
import { IncomingForm } from 'formidable';
import { readUser, writeUploadedFileReference, readAllUploadedFileReferencesBySession, paginateSlackPrivateUrls } from '../Utils/db.util';
import axios from 'axios';
import { getParameterValue } from '../Config/awsParams.config';

interface FormFields {
  channel: string[];
  userID: string[];
  sessionID: string[];
  comment: string[];
  messageBatchSize: string[];
}

interface File {
  map: any;
  size: number;
  filepath: string;
  originalFilename: string;
  mimetype: string;
  lastModifiedDate?: Date;
}

interface Request {
  user?: string;
  userId?: string;
}

export const api = async (request: express.Request, response: express.Response) => {
  response.status(400).send('Something went wrong, you should not be here!');
}

export const getChannels = async (request: express.Request, response: express.Response) => {
  request.user = request.user as string;

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

  if (!request.userId) {
    return response.status(400).send('UserID is required');
  }

  const pageNumber = parseInt(page, 10);
  const limitNumber = parseInt(limit, 10);

  const fileReferences = await paginateSlackPrivateUrls(request.userId as string, pageNumber, limitNumber);
  
  if (!fileReferences.length) {
    return response.status(404).send('No file URLs found');
  }

  const urls = fileReferences.map(fileReference => ({
    url: fileReference.slackPrivateFileURL,
    name: fileReference.name
  }));
  response.json(urls);
};

export const getImagesProxy = async (request: express.Request, response: express.Response) => {
  const { imageUrl, name } = request.query;
  
  if (!imageUrl) {
    return response.status(400).send('Image URL is required');
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
    console.debug(`Creating directory at path: ${uploadDirPath}`);
    fs.mkdirSync(uploadDirPath);
  }
  form.uploadDir = uploadDirPath;
  form.keepExtensions = true;
  form.options.maxFileSize = 2000 * 1024 * 1024;
  form.options.maxTotalFileSize = 2000 * 1024 * 1024;

  form.parse(request, async (err: Error, fields: FormFields, files: { [key: string]: File }) => {
    console.log('Started parsing form for file upload...');
    if (err) {
      console.error(`Error processing upload: ${err}`);
      return response.status(500).json({ error: 'Error processing upload' });
    }

    console.log(`Received files: ${Object.keys(files).map(key => files[key].originalFilename).join(', ')}`);
  
    console.log(`Uploading files to channel: ${fields.channel ? fields.channel[0] : 'undefined'} for User: ${request.userId || 'undefined'} and Session: ${fields.sessionID ? fields.sessionID[0] : 'undefined'}`);
    const slackbot = new SlackBot(fields.channel[0]);
  
    const uploadedFiles = files.files.map((file: File) => ({
      name: file.originalFilename,
      path: file.filepath,
      size: file.size,
      sessionID: fields.sessionID[0], // is returned as array, so access the first element
      userID: request.userId, // is returned as array, so access the first element
      type: file.mimetype,
      lastModifiedDate: file.lastModifiedDate,
      isUploaded: false
    }));
  
    try {
      for (const file of uploadedFiles) {
        await writeUploadedFileReference(file);
      }
    } catch (error) {
      console.error(`Error uploading files: ${error}`);
      response.status(500).json({ error: 'Internal Server Error' });
    }
  });
  console.log('Finished parsing form.');
};

export const uploadFinalFiles = async (request: express.Request, response: express.Response) => {
  // This function is similar to the one above. The differences are that 1.) in this function, the user's
  // info is used to get thier Slack access token, and 2.) it then gets all the file references from the database
  /// which are then passed to the slackbot to be uploaded to the specified channel.

  const user = await readUser(request.user as string);
  const slackAccessToken = await getParameterValue(`SLA_IDAU${user.userData.authedUser?.id}IDT${user.userData.team?.id}`);

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

  form.parse(request, async (err: Error, fields: FormFields, files: { [key: string]: File }) => {
    console.log('Started parsing final form for file upload...');

    console.log(`Starting final upload process for session: ${fields.sessionID?.[0]}, User: ${request.userId}`);

    console.log(`Received final files: ${Object.keys(files).map(key => files[key].originalFilename).join(', ')}`);

    if (Object.keys(fields).length === 0 && Object.keys(files).length === 0) {
      return response.status(404).send('No fields or files found');
    }

    if (err) {
      console.error(`Error processing upload: ${err}`);
      return response.status(500).json({ error: 'Error processing upload' });
    }
  
    console.log(`Uploading final files to channel: ${fields.channel} for User: ${request.userId} and Session: ${fields.sessionID}`);
    const slackbot = new SlackBot(fields.channel[0], slackAccessToken);

    const uploadedFiles = files.files.map((file: File) => ({
      name: file.originalFilename,
      path: file.filepath,
      size: file.size,
      sessionID: fields.sessionID[0], // is returned as array, so access the first element
      userID: request.userId,
      type: file.mimetype,
      lastModifiedDate: file.lastModifiedDate,
      isUploaded: false
    }));
  
    try {
      if (uploadedFiles.length === 0) {
        return response.status(400).send('No files to upload.');
      }

      for (const file of uploadedFiles) {
        await writeUploadedFileReference(file);
      }
      console.debug(`Starting to upload files to Slack for session: ${fields.sessionID[0]}`);
      const filesToUpload = await readAllUploadedFileReferencesBySession(fields.sessionID[0]);
      await slackbot.batchAndUploadFiles(filesToUpload, request.userId ?? '', fields.sessionID[0], parseInt(fields.messageBatchSize[0]), fields.comment[0]);
      response.status(200).json({ message: 'Final files uploaded successfully!' });
    } catch (error) {
      console.trace(`Error uploading files: ${error}`);
      response.status(500).json({ error: 'Internal Server Error' });
    }
    console.log('Finished parsing final form.');
  });
}