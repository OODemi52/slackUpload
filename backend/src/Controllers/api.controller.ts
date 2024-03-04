import fs from 'fs';
import path from 'path';
import express from 'express';
import SlackBot from '../Models/slackbot.model';
import { IncomingForm } from 'formidable';
import { writeUploadedFileReference, readAllUploadedFileReferencesBySession } from '../Utils/db.util';

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
      console.log(filesToUpload);
      await slackbot.batchAndUploadFiles(filesToUpload, parseInt(fields.messageBatchSize[0]), fields.comment[0]);
      res.status(200).json({ message: 'Final files uploaded successfully!' });
    } catch (error) {
      console.error(`Error uploading files: ${error}`);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  });
}