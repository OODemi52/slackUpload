import fs from 'fs';
import path from 'path';
import express from 'express';
import SlackBot from '../Models/slackbot';
import { IncomingForm } from 'formidable';

interface FormFields {
  channel: string;
}

interface File {
  map: any;
  size: number;
  filepath: string;
  originalFilename: string;
  mimetype: string;
  lastModifiedDate?: Date;
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

  // Formidable config
  form.uploadDir = '/tmp';
  form.keepExtensions = true;
  form.maxFileSize = 50 * 1024 * 1024; // 50MB
  
  form.parse(req, async (err: Error, fields: FormFields, files: { [key: string]: File }) => {
    if (err) {
      console.error(`Error processing upload: ${err}`);
      return res.status(500).json({ error: 'Error processing upload' });
    }
  
    const { channel } = fields;
    console.log(`Uploading files to channel: ${channel}`);
    const slackbot = new SlackBot(channel[0]);
  
    // Transform the 'files' object to match the expected structure
    const uploadedFiles = files.files.map((file: File) => ({
      size: file.size,
      path: file.filepath,
      name: file.originalFilename,
      type: file.mimetype,
      lastModifiedDate: file.lastModifiedDate
    }));
  
    try {
      await slackbot.batchAndUploadFiles(uploadedFiles, 14);
      res.status(200).json({ message: 'Files uploaded successfully!' });
    } catch (error) {
      console.error(`Error uploading files: ${error}`);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  });
};