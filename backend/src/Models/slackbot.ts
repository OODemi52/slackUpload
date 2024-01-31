import * as dotenv from 'dotenv';
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

  async batchAndUploadFiles(uploadedFiles: UploadedFile[], message_length: number): Promise<void> {
    console.log(uploadedFiles)
    const files_upload: { filename: string, file: string }[] = [];

    for (let i = 0; i < uploadedFiles.length; i++) {

      const filename: string = uploadedFiles[i].name;
      const file: string = uploadedFiles[i].path;
      
      files_upload.push({file, filename});
      console.log('Files to upload:', files_upload);

      if ((i + 1) % message_length === 0 || i === uploadedFiles.length - 1) {
        await this.uploadFilesToSlackChannel(files_upload);
        files_upload.length = 0;
      }
    }
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
