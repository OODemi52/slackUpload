import dotenv from 'dotenv';
import fs from 'fs';
import {  updateUploadedFileReferenceWithSlackPrivateUrl } from '../Utils/db.util';
import { WebClient } from '@slack/web-api';

dotenv.config();

interface FormidableFile {
  size: number;
  path: string;
  name: string;
  type: string;
  lastModifiedDate?: Date;
}

interface UploadedFile {
  size: number;
  path: string;
  name: string;
  type: string;
  lastModifiedDate?: Date;
};

export default class SlackBot {
  private channel: string;
  private clientPromise: Promise<WebClient>;

  constructor(channel?: string, accessToken?: string) {
    this.channel = channel || ''
    this.clientPromise = this.setupClient(accessToken);
  }

  private async setupClient(accessToken: string | undefined): Promise<WebClient> {
    //const slackToken = await getParameterValue('SLACK_TOKEN'); // For local testing
    return new WebClient(accessToken);
  }

  async getChannels() {
    try {
      const client = await this.clientPromise;
      const result = await client.conversations.list();
      return result.channels?.map((channel) => [`${channel.id}`, `${channel.name}`]) ?? [];
    } catch (error) {
      console.error(`Error fetching channels: ${error}`);
      return [];
    }
  }

  async deletionPromises(uploadedFiles: UploadedFile[]): Promise<void[]> {
    const deletionPromises = uploadedFiles.map((file: UploadedFile) =>
      fs.promises.unlink(file.path).then(() => {
        console.log(`Successfully deleted file ${file.path}`);
      }).catch((unlinkErr) => {
        console.error(`Error deleting file ${file.path}: ${unlinkErr}`);
      })
    );
    return Promise.all(deletionPromises);
  }

  async batchAndUploadFiles(uploadedFiles: UploadedFile[], userID: string, sessionID: string, messageBatchSize: number, comment: string): Promise<void> {
    const sortedFiles = uploadedFiles.sort((a, b) => {
      return a.name.localeCompare(b.name, undefined, { numeric: true, sensitivity: 'base' });
    });

    const totalBatches = Math.ceil(sortedFiles.length / messageBatchSize);

    for (let i = 0; i < sortedFiles.length; i += messageBatchSize) {
      const batchFiles = sortedFiles.slice(i, i + messageBatchSize);
      const files_upload = batchFiles.map(file => ({
        filename: file.name,
        file: file.path
      }));

      const batchNumber = Math.floor(i / messageBatchSize) + 1;
      console.log(`Preparing batch ${batchNumber} out of ${totalBatches} for upload. Files to upload:`, files_upload);

      const privateUrls = await this.uploadFilesToSlackChannel(files_upload, comment);

      privateUrls.forEach(async (url, index) => {
        const file = batchFiles[index];
        await  updateUploadedFileReferenceWithSlackPrivateUrl(userID, sessionID, file.name, url);
        console.log(`Updated file reference with Slack URL for file: ${file.name}`);
    });

      await this.deletionPromises(batchFiles);
    }
    console.log(`All files uploaded to Slack`);
  }
  
  private async uploadFilesToSlackChannel(file_uploads: { filename: string, file: string }[], comment: string): Promise<string[]> {
    try {
      const currentDate = new Date().toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      });

      if (!this.channel) {
        throw new Error('No channel specified');
      }

      const client = await this.clientPromise;

      const response: any = await client.files.uploadV2({
        channel_id: this.channel,
        initial_comment: comment || currentDate,
        file_uploads : file_uploads,
      });

      console.log(`Uploaded files to Slack`);

      const privateUrls = response.files.flatMap((fileGroup: { files: { url_private: any; }[]; }) => fileGroup.files.map((file: { url_private: any; }) => file.url_private));
      console.log(`Private URLs for uploaded files:`, privateUrls);
      return privateUrls;
      
    } catch (error: any) {
      if (error.code === 'slack_error_code') {
        console.error(`Error uploading files to Slack: ${error.message}`);
      } else {
        console.error(`Unexpected error: ${error}`);
      }
      throw error;
    } 
 }
}
