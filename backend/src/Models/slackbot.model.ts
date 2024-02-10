import dotenv from 'dotenv';
import fs from 'fs';
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
  private client: WebClient;
  private channel: string;

  constructor(channel?: string) {
    this.client = new WebClient(process.env.SLACK_TOKEN);
    this.channel = channel || ''
  }

  async getChannels() {
    try {
      const result = await this.client.conversations.list();
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

  async batchAndUploadFiles(uploadedFiles: UploadedFile[], message_length: number): Promise<void> {
    const sortedFiles = uploadedFiles.sort((a, b) => {
      return a.name.localeCompare(b.name, undefined, { numeric: true, sensitivity: 'base' });
    });

    const totalBatches = Math.ceil(sortedFiles.length / message_length);

    for (let i = 0; i < sortedFiles.length; i += message_length) {
      const batchFiles = sortedFiles.slice(i, i + message_length);
      const files_upload = batchFiles.map(file => ({
        filename: file.name,
        file: file.path
      }));

      const batchNumber = Math.floor(i / message_length) + 1;
      console.log(`Preparing batch ${batchNumber} out of ${totalBatches} for upload. Files to upload:`, files_upload);

      await this.uploadFilesToSlackChannel(files_upload);
      await this.deletionPromises(batchFiles);
    }

    console.log(`All files uploaded to Slack`);
  }
  
  private async uploadFilesToSlackChannel(file_uploads: { filename: string, file: string }[]): Promise<void> {
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

      await this.client.files.uploadV2({
        channel_id: this.channel,
        initial_comment: currentDate,
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
