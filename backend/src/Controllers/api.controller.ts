import fs from 'fs';
import path from 'path';
import express from 'express';
import SlackBot from '../Models/slackbot.model';
import { IncomingForm } from 'formidable';
import { writeUploadedFileReference, readAllUploadedFileReferencesBySession, paginateSlackPrivateUrls } from '../Utils/db.util';
import axios from 'axios';

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

export const api = async (request: express.Request, response: express.Response) => {
  response.status(400).send('Something went wrong, you should not be here!');
}

export const getChannels = async (request: express.Request, response: express.Response) => {
  try {
      const slackbot = new SlackBot();
      const channels = await slackbot.getChannels();
      response.status(200).json(channels);
  } catch (error) {
      console.error(`Error fetching channels: ${error}`);
      response.status(500).json({ error: 'Failed to retrieve channels' });
  }
};

export const getImagesUrls = async (req: express.Request, res: express.Response) => {
  const { userID, page = '1', limit = '10' } = req.query as { userID: string, page: string, limit: string };

  if (!userID) {
    return res.status(400).send('UserID is required');
  }

  const pageNumber = parseInt(page, 10);
  const limitNumber = parseInt(limit, 10);

  const fileReferences = await paginateSlackPrivateUrls(userID, pageNumber, limitNumber);
  
  if (!fileReferences.length) {
    return res.status(404).send('No file URLs found');
  }

  const urls = fileReferences.map(fileReference => ({
    url: fileReference.slackPrivateFileURL,
    name: fileReference.name
  }));
  res.json(urls);
};

export const getImagesProxy = async (req: express.Request, res: express.Response) => {

  const { imageUrl, name } = req.query;
  
  if (!imageUrl) {
    return res.status(400).send('Image URL is required');
  }

  try {
    const response = await axios.get(decodeURIComponent(imageUrl.toString()), {
      responseType: 'stream',
      headers: {
        Authorization: `Bearer ${process.env.SLACK_TOKEN}`,
      },
    });

    res.set(response.headers);
    res.setHeader('Content-Type', 'image/jpg');
    res.setHeader('Cross-Origin-Resource-Policy', 'cross-origin');
    res.status(response.status);

    // Stream the image data to the client
    response.data.pipe(res);
  } catch (error) {
    console.error('Error fetching image:', error);
    res.status(500).send('Error fetching image');
  }
};

export const uploadFiles = async (req: express.Request, res: express.Response) => {
  const form = new IncomingForm() as any;

  form.uploadDir = path.join(__dirname, '../../uploads');
  form.keepExtensions = true;
  form.options.maxFileSize = 2000 * 1024 * 1024;
  form.options.maxTotalFileSize = 2000 * 1024 * 1024;

  form.parse(req, async (err: Error, fields: FormFields, files: { [key: string]: File }) => {
    if (err) {
      console.error(`Error processing upload: ${err}`);
      return res.status(500).json({ error: 'Error processing upload' });
    }
  
    const { channel, userID, sessionID, comment } = fields;
    console.log(`Uploading files to channel: ${channel} for User: ${fields.userID} and Session: ${fields.sessionID}`);
    const slackbot = new SlackBot(channel[0]);
  
    const uploadedFiles = files.files.map((file: File) => ({
      name: file.originalFilename,
      path: file.filepath,
      size: file.size,
      sessionID: fields.sessionID[0], // is returned as array, so access the first element
      userID: fields.userID[0], // is returned as array, so access the first element
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
      res.status(500).json({ error: 'Internal Server Error' });
    }
  });
};

export const uploadFinalFiles = async (req: express.Request, res: express.Response) => {
  const form = new IncomingForm() as any;

  form.multiples = true;

  form.uploadDir = path.join(__dirname, '../../uploads');
  form.keepExtensions = true;
  form.options.maxFileSize = 2000 * 1024 * 1024;
  form.options.maxTotalFileSize = 2000 * 1024 * 1024;

  form.parse(req, async (err: Error, fields: FormFields, files: { [key: string]: File }) => {
    if (err) {
      console.error(`Error processing upload: ${err}`);
      return res.status(500).json({ error: 'Error processing upload' });
    }
  
    const { channel, userID, sessionID, comment } = fields;
    console.log(`Uploading final files to channel: ${channel} for User: ${fields.userID} and Session: ${fields.sessionID}`);
    const slackbot = new SlackBot(channel[0]);
  
    const uploadedFiles = files.files.map((file: File) => ({
      name: file.originalFilename,
      path: file.filepath,
      size: file.size,
      sessionID: fields.sessionID[0], // is returned as array, so access the first element
      userID: fields.userID[0], // is returned as array, so access the first element
      type: file.mimetype,
      lastModifiedDate: file.lastModifiedDate,
      isUploaded: false
    }));
  
    try {
      console.log(fields);
      for (const file of uploadedFiles) {
        await writeUploadedFileReference(file);
      }
      const filesToUpload = await readAllUploadedFileReferencesBySession(fields.sessionID[0]);
      await slackbot.batchAndUploadFiles(filesToUpload, fields.userID[0], fields.sessionID[0], parseInt(fields.messageBatchSize[0]), fields.comment[0]);
      res.status(200).json({ message: 'Final files uploaded successfully!' });
    } catch (error) {
      console.error(`Error uploading files: ${error}`);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  });
}