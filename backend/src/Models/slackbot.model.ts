import dotenv from 'dotenv';
import fs from 'fs';
import { WebClient } from '@slack/web-api';
import { getParameterValue } from '../Config/awsParams.config';

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

  constructor(channel?: string) {
    this.channel = channel || ''
    this.clientPromise = this.setupClient();
  }

  private async setupClient(): Promise<WebClient> {
    const slackToken = await getParameterValue('SLACK_TOKEN');
    return new WebClient(slackToken);
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

  async batchAndUploadFiles(uploadedFiles: UploadedFile[], messageBatchSize: number, comment: string): Promise<void> {
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

      await this.uploadFilesToSlackChannel(files_upload, comment);
      await this.deletionPromises(batchFiles);
    }
    console.log(`All files uploaded to Slack`);
  }
  
  private async uploadFilesToSlackChannel(file_uploads: { filename: string, file: string }[], comment: string): Promise<void> {

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

      await client.files.uploadV2({
        channel_id: this.channel,
        initial_comment: comment || currentDate,
        file_uploads : file_uploads,
      });

      console.log(`Uploaded files to Slack`);

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
