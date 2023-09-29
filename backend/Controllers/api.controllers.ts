import express from 'express';
import SlackBot from '../Models/slackbot';



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

  export const uploadFiles = async (request: express.Request, response: express.Response) => {
    
    interface UploadObject {
        channel: string,
        dirName: string
      }
    
    const { dirName , channel }: UploadObject = request.body;

    const slackbot = new SlackBot(dirName, channel);
    try {
         await slackbot.processFilesAndUpload();
        response.status(200).json({ message: 'Files Uploaded Successfully!' });
    } catch (error) {
        console.error(`Error uploading files: ${error}`);
        response.status(500).json({ error: 'Internal Server Error' });
    }
  };
