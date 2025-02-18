import fs from 'fs';
import path from 'path';
import sharp from "sharp";
import axios from 'axios';
import express from 'express';
import archiver from 'archiver';
import { IncomingForm } from 'formidable';
import { FileStore } from '@tus/file-store';
import { Server, EVENTS } from '@tus/server';
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

const progressCallbacks = new Map<string, (progress: number) => void>();

export const api = async (request: express.Request, response: express.Response) => {
  response.status(400).send('Something went wrong, you should not be here!');
}

export const getChannels = async (request: express.Request, response: express.Response) => {

  let slackAccessToken: string;

  if (process.env.NODE_ENV === 'development') {
    slackAccessToken = process.env.SS_SLACK_TOKEN as string;
  } else {
    if (!request.userId) {
      return response.status(400).send('UserID is required');
    }

    const user = await readUser(request.user as string);
    slackAccessToken = await getParameterValue(`SLA_IDAU${user.userData.authedUser?.id}IDT${user.userData.team?.id}`);

    if (!slackAccessToken) {
      return response.status(500).send('Failed to retrieve Slack access token');
    }
  }

  try {
      const slackbot = new SlackBot('', slackAccessToken);
      const channels = await slackbot.getChannels();
      response.status(200).json(channels);
  } catch (error) {
      console.error(`Error fetching channels: ${error}`);
      response.status(500).json({ error: 'Failed to retrieve channels' });
  }
};

export const addBotToChannel = async (request: express.Request, response: express.Response) => {
  
  let slackAccessToken: string;

  if (process.env.NODE_ENV === 'development') {
    slackAccessToken = process.env.SS_SLACK_TOKEN as string;
  } else {
    if (!request.userId) {
      return response.status(400).send('UserID is required');
    }

    const user = await readUser(request.user as string);
    slackAccessToken = await getParameterValue(`SLA_IDAU${user.userData.authedUser?.id}IDT${user.userData.team?.id}`);

    if (!slackAccessToken) {
      return response.status(500).send('Failed to retrieve Slack access token');
    }
  }

  const { channelId } = request.body
  if (!channelId) {
    return response.status(400).send("Channel ID required")
  }

  try {
    const slackbot = new SlackBot(channelId, slackAccessToken);
    await slackbot.addBotToChannel(channelId);
    response.status(200).json({ message: 'Bot added to channel successfully' });
  } catch (error) {
    console.error(`Error adding bot to channel: ${error}`);
    response.status(500).json({ error: 'Failed to add bot to channel' });
  }
}

export const getImagesUrls = async (request: express.Request, response: express.Response) => {
  try{
    let userId: string;

    if (process.env.NODE_ENV === 'development') {
      userId = process.env.SS_USER_ID as string;
    } else {
      if (!request.userId) {
        return response.status(400).send('UserID is required');
      }
      userId = request.userId
    }

    const { page = '1', limit = '16' } = request.query as { page: string, limit: string };
    const pageNumber = parseInt(page, 10);
    const limitNumber = parseInt(limit, 10);

    const fileReferences = await paginateSlackPrivateUrls(userId as string, pageNumber, limitNumber);
    
    if (!fileReferences.length) {
      console.log("Nothing")
      return response.status(200).json({ imageUrls: [], nextPage: null });
    }

    const imageUrls = fileReferences
    .filter(fileReference => fileReference.slackPrivateFileURL && fileReference.slackPrivateFileURL !== '' && fileReference.slackFileID && fileReference.slackFileID !== '')
    .map(fileReference => ({
      url: fileReference.slackPrivateFileURL,
      name: fileReference.name,
      fileID: fileReference.slackFileID,
    }));

    const nextPage = imageUrls.length === limitNumber ? pageNumber + 1 : null;

    console.log("Image URLs: ", imageUrls.length)

    response.status(200).json({ imageUrls, nextPage });
  } catch(error) {
    console.error(`Error trying to get image urls: ${error}`);
    response.status(500).json({ error: 'Failed get image urls' });
  }
};

export const getImagesProxy = async (request: express.Request, response: express.Response) => {
  try {
    let slackAccessToken: string;

    if (process.env.NODE_ENV === 'development') {
      slackAccessToken = process.env.SS_SLACK_TOKEN as string;
    } else {
      if (!request.userId) {
        return response.status(400).send('UserID is required');
      }

      const user = await readUser(request.userId);
      slackAccessToken = await getParameterValue(`SLA_IDAU${user.userData.authedUser?.id}IDT${user.userData.team?.id}`);

      if (!slackAccessToken) {
        return response.status(500).send('Failed to retrieve Slack access token');
      }
    }

    const { imageUrl, size } = request.query;
    
    if (!imageUrl) {
      return response.status(400).send('Image URL is required');
    }

    const sizeParam = size === 'thumb' ? '?w=75&h=75' : '?w=360';

    const axiosResponse = await axios.get(decodeURIComponent(imageUrl.toString()), {
      responseType: 'arraybuffer',
      headers: {
        Authorization: `Bearer ${slackAccessToken}`,
      },
    });

    const resizedImage = await sharp(axiosResponse.data)
        .resize(size === 'thumb' ? 75 : 360, size === 'thumb' ? 75 : undefined, {
          fit: size === 'thumb' ? 'cover' : 'inside',
          withoutEnlargement: true
        })
        .webp({
          quality: size === 'thumb' ? 80 : 90,
          effort: 4
        })
        .toBuffer();

    response.set({
      'content-type': 'image/webp',
      'cross-origin-resource-policy': 'cross-origin',
      'cache-control': 'public, max-age=31536000'
    });

    response.send(resizedImage);

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

  form.multiples = true;

  const uploadDirPath = path.join(__dirname, '../../uploads');

  if (!fs.existsSync(uploadDirPath)) {
    fs.mkdirSync(uploadDirPath);
  }

  form.uploadDir = uploadDirPath;
  form.keepExtensions = true;
  form.options.maxFileSize = 2000 * 1024 * 1024;
  form.options.maxTotalFileSize = 2000 * 1024 * 1024;

  const formPromise = new Promise((resolve, reject) => {
    form.parse(request, async (err: Error, fields: FormFields, files: { [key: string]: UploadedFile }) => {
      try {
        if (err) {
          throw new Error(`Error processing upload: ${err}`);
        }

        if (Object.keys(fields).length === 0 && Object.keys(files).length === 0) {
          throw new Error('No fields or files found');
        }

        if (!Array.isArray(files.files)) {
          throw new Error('Invalid files format.');
        }

        let userId: string;

        if (process.env.NODE_ENV === 'development') {
          userId = process.env.SS_USER_ID as string;
        } else {
          if (!request.userId) {
            return response.status(400).send('UserID is required');
          }
          userId = request.userId;
        }

        const parsedFiles: ParsedFile[] = files.files.map((file: UploadedFile) => ({
          name: file.originalFilename,
          path: file.filepath,
          size: file.size,
          sessionID: fields.sessionID[0], // is returned as array, so access the first element
          userID: userId,
          type: file.mimetype,
          lastModifiedDate: file.lastModifiedDate,
          isUploaded: true,
        }));

        console.log("Files parsed in this batch", parsedFiles.length);

        for (const file of parsedFiles) {
          console.log(`Attempting to write file reference for ${file.name}`);
          await writeUploadedFileReference(file);
          const fileRefs = await readAllUploadedFileReferencesBySession(fields.sessionID[0]);
          const fileExists = fileRefs.some(ref => ref.name === file.name);
          if (!fileExists) {
            throw new Error(`File reference verification failed for ${file.name}`);
          }
        }

        resolve({ success: true });
      } catch (error) {
        console.error(`Error uploading files: ${error}`);
        reject(error);
      }
    });
  });

  try {
    await formPromise;
    response.status(200).json({ message: 'Files processed successfully' });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Internal Server Error';
    const status = message === 'No fields or files found' ? 404 : 500;
    response.status(status).json({ error: message });
  }
};

export const uploadProgress = async(request: express.Request, response: express.Response) => {
  
  const { sessionID } = request.body

  response.writeHead(200, {
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache',
    'Connection': 'keep-alive'
  });
  response.flushHeaders()

  const sendProgress = (progress: number) => {
    console.log(`Sending progress update: ${progress}% || apiC`);
    response.write(`data: ${JSON.stringify({ type: progress < 100.0 ? 'progress' : 'complete', progress })}\n\n`);
  };

  progressCallbacks.set(sessionID, sendProgress);

  request.on('close', () => {
    progressCallbacks.delete(sessionID);
    response.end();
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

  const formPromise = new Promise((resolve, reject) => {
    form.parse(request, async (err: Error, fields: FormFields, files: { [key: string]: UploadedFile }) => {

      async function deleteFile(file: ParsedFile): Promise<void> {
        if (!file.path) {
          console.error(`No file path provided for file: ${file.name}`);
          return;
        }

        try {
          const exists = await fs.promises.access(file.path)
              .then(() => true)
              .catch(() => false);

          if (!exists) {
            console.log(`File ${file.path} already deleted or doesn't exist`);
            return;
          }

          await new Promise(resolve => setTimeout(resolve, 100));

          await fs.promises.unlink(file.path);
          console.log(`Successfully deleted file ${file.path}`);
        } catch (unlinkErr) {
          console.error(`Error deleting file ${file.path}: ${unlinkErr}`);
        }
      }

      try {

        if (err) {
          throw new Error(`Error processing upload: ${err}`);
        }

        if (Object.keys(fields).length === 0 && Object.keys(files).length === 0) {
          throw new Error('No fields or files found');
        }

        if (!Array.isArray(files.files)) {
          throw new Error('Invalid files format.');
        }

        let userId: string;
        let slackAccessToken: string;

        if (process.env.NODE_ENV === 'development') {
          userId = process.env.SS_USER_ID as string;
          slackAccessToken = process.env.SS_SLACK_TOKEN as string;
        } else {
          if (!request.userId) {
            return response.status(400).send('UserID is required');
          }

          userId = request.userId;
          const user = await readUser(request.userId);
          slackAccessToken = await getParameterValue(`SLA_IDAU${user.userData.authedUser?.id}IDT${user.userData.team?.id}`);

          if (!slackAccessToken) {
            return response.status(500).send('Failed to retrieve Slack access token');
          }
        }

        const slackbot = new SlackBot(fields.channel[0], slackAccessToken);

        if (!Array.isArray(files.files)) {
          return response.status(400).send('Invalid files format.');
        }

        const parsedFiles: ParsedFile[] = files.files.map((file: UploadedFile) => ({
          name: file.originalFilename,
          path: file.filepath,
          size: file.size,
          sessionID: fields.sessionID[0], // is returned as array, so access the first element
          userID: userId,
          type: file.mimetype,
          lastModifiedDate: file.lastModifiedDate,
          isUploaded: true,
        }));
        console.log("Files parsed in last batch", parsedFiles.length);

        if (parsedFiles.length === 0) {
          return response.status(400).send('No files to upload.');
        }

        await Promise.all(parsedFiles.map(async (file) => { await writeUploadedFileReference(file) }));

        const filesToUpload = await readAllUploadedFileReferencesBySession(fields.sessionID[0]);

        const processedFiles = await slackbot.batchAndUploadFiles(filesToUpload, userId, fields.sessionID[0], parseInt(fields.messageBatchSize[0]), fields.comment[0], (progress) => {
          const sendProgress = progressCallbacks.get(fields.sessionID[0]);
          if (sendProgress) {
            sendProgress(progress);
          } else {
          }
        });

        for (const file of processedFiles) {
          try {
            await deleteFile(file);
          } catch (error) {
            console.error(`Failed to delete file ${file.name}:`, error);
          }
        }

        resolve({ success: true });
      } catch (error) {
        console.trace(`Error uploading files: ${error}`);
        reject(error);
      }
    });
    })

  try {
    await formPromise;
    response.status(200).json({ message: 'Files processed successfully' });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Internal Server Error';
    const status = message === 'No fields or files found' ? 404 : 500;
    response.status(status).json({ error: message });
  }
};

export const deleteFiles = async (request: express.Request, response: express.Response) => {
  
  const files = request.body.files as { id: string; deleteFlag: string; }[];

  if (!files || !Array.isArray(files) || files.length === 0) {
    return response.status(400).send('Invalid file data');
  }

  try {
    let userId: string;
    let slackAccessToken: string;

    if (process.env.NODE_ENV === 'development') {
      userId = process.env.SS_USER_ID as string;
      slackAccessToken = process.env.SS_SLACK_TOKEN as string;
    } else {
      if (!request.userId) {
        return response.status(400).send('UserID is required');
      }

      userId = request.userId;
      const user = await readUser(request.userId);
      slackAccessToken = await getParameterValue(`SLA_IDAU${user.userData.authedUser?.id}IDT${user.userData.team?.id}`);

      if (!slackAccessToken) {
        return response.status(500).send('Failed to retrieve Slack access token');
      }
    }

    const slackbot = new SlackBot('', slackAccessToken);
    const fileIDs = files.map(file => file.id);

    const deleteFromSlack = async () => {
      await slackbot.deleteFilesFromSlack(fileIDs);
    };
    const deleteFromApp = async (): Promise<number | undefined> => {
      return await anonymizeUploadedFileReferences(userId, fileIDs);
    };

    switch (files[0].deleteFlag) {
      case 'a':
        const deletedFromApp = await deleteFromApp();
        response.status(200).json({ message: `${deletedFromApp?.toString()} files deleted from Slackshots successfully.` });
        break;
      case 'b':
        await deleteFromSlack();
        const deletedFromBoth = await deleteFromApp();
        response.status(200).json({ message: `${deletedFromBoth?.toString()} files deleted from both Slack and Slackshots successfully.` });
        break;
      default:
        return response.status(400).send('Invalid delete flag');
    }
  } catch (error) {
    response.status(500).json({ error: 'Internal Server Error' });
  }
};

export const downloadFiles = async (request: express.Request, response: express.Response) => {

  const files = request.body.files as { url: string; name: string }[];

  if (!files || !Array.isArray(files) || files.length === 0) {
    return response.status(400).send('Invalid file data');
  }

  try {
    let slackAccessToken: string;

    if (process.env.NODE_ENV === 'development') {
      slackAccessToken = process.env.SS_SLACK_TOKEN as string;
    } else {
      if (!request.userId) {
        return response.status(400).send('UserID is required');
      }

      const user = await readUser(request.userId);
      slackAccessToken = await getParameterValue(`SLA_IDAU${user.userData.authedUser?.id}IDT${user.userData.team?.id}`);

      if (!slackAccessToken) {
        return response.status(500).send('Failed to retrieve Slack access token');
      }
    }

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