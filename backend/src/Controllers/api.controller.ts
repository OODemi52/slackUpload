import fs from 'fs';
import path from 'path';
import sharp from "sharp";
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

interface TusUploadMetadataJsonFile {
  id: string;
  size: number;
  offset: number;
  metadata: {
    filename: string;
    filetype: string;
    sessionID: string;
    channel: string;
    comment: string | null;
    messageBatchSize: string;
  };
  creation_date: string;
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


export const finalizeUpload = async (request: express.Request, response: express.Response) => {

  // Error checking

  // Transaction db write to uploadedFiles table
  // Delete files from uploads folder if fail, also implement retry logic (1x)
  //Get all files from uploadedFiles table with sessionID
  // Upload files to slack
  // Delete files from uploads folder

  let slackAccessToken: string;
  let userID: string;
   
  const getUploadJsonDataBySessionId = async (sessionId: string): Promise<TusUploadMetadataJsonFile[]> => {
    //TODO - Optimize the search for JSON files so that we don't have to read all files in the directory
    if (!sessionId) {
      throw new Error('Session ID is required');
    }
    
    try {
      const uploadDirPath = path.join(__dirname, '../../uploads');
      const files = await fs.promises.readdir(uploadDirPath);
      const jsonFiles = files.filter(file => file.endsWith('.json'));

      const jsonDataArray: TusUploadMetadataJsonFile[] = [];

      for (const jsonFile of jsonFiles) {
        
        const filePath = path.join(uploadDirPath, jsonFile);
        const fileContent = await fs.promises.readFile(filePath, 'utf8');
        const jsonData = JSON.parse(fileContent);

        if (jsonData.metadata.sessionID === sessionId) {
          jsonDataArray.push(jsonData);
        }
      }

      if (jsonDataArray.length === 0) {
        throw new Error(`No JSON files found for session ID: ${sessionId}`);
      }

      return jsonDataArray;

    } catch (error) {
      console.error(`Error reading JSON files for session ID ${sessionId}:`, error);
      throw error;
    }
  };

  try {

    if (process.env.NODE_ENV === 'development') {
      slackAccessToken = process.env.SS_SLACK_TOKEN as string;
      userID = process.env.SS_USER_ID as string;
    } else {
      if (!request.userId) {
        return response.status(400).send('UserID is required');
      }
      userID = request.userId;
      const user = await readUser(userID);
      slackAccessToken = await getParameterValue(`SLA_IDAU${user.userData.authedUser?.id}IDT${user.userData.team?.id}`);
      if (!slackAccessToken) {
        return response.status(500).send('Failed to retrieve Slack access token');
      }
    }

    const { sessionID } = request.body;

    if (!sessionID) {
      return response.status(400).send('Missing Session ID');
    }

    const sessionFilesMetadata = await getUploadJsonDataBySessionId(sessionID);

    const slackbot = new SlackBot(sessionFilesMetadata[0].metadata.channel, slackAccessToken);

    const parsedFiles: ParsedFile[] = sessionFilesMetadata.map((jsonData) => ({
      name: jsonData.metadata.filename,
      path: path.join(__dirname, '../../uploads', jsonData.id),
      size: jsonData.size,
      sessionID: jsonData.metadata.sessionID,
      userID,
      type: jsonData.metadata.filetype,
      lastModifiedDate: new Date(jsonData.creation_date),
      isUploaded: true,
    }));

    if (parsedFiles.length === 0) {
      return response.status(400).send('No files to upload.');
    }

    await Promise.all(parsedFiles.map(async (file) => { await writeUploadedFileReference(file) }));

    const filesToUpload = await readAllUploadedFileReferencesBySession(sessionID);

    await slackbot.batchAndUploadFiles(filesToUpload, userID, sessionID, parseInt(sessionFilesMetadata[0].metadata.messageBatchSize), sessionFilesMetadata[0].metadata.comment ?? '', (progress) => {
      const sendProgress = progressCallbacks.get(sessionID);
      if (sendProgress) {
      sendProgress(progress);
      }
    });
    
    response.status(200).json({ message: 'Files processed successfully', data: sessionFilesMetadata });
  } catch (error) {
    
    console.error('Error finalizing upload:', error);
    response.status(500).json({ error: 'Internal Server Error' });   
  } 
}

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