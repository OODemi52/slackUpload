import dotenv from 'dotenv';
import fs from 'fs';
import { updateUploadedFileReferenceWithSlackPrivateUrl } from '../Utils/db.util';
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

  private async deleteFile(file: UploadedFile): Promise<void> {
    try {
      await fs.promises.unlink(file.path);
      console.log(`Successfully deleted file ${file.path}`);
    } catch (unlinkErr) {
      console.error(`Error deleting file ${file.path}: ${unlinkErr}`);
    }
  }

  async batchAndUploadFiles(uploadedFiles: UploadedFile[], userID: string, sessionID: string, messageBatchSize: number, comment: string): Promise<void> {
    const sortedFiles = uploadedFiles.sort((a, b) => a.name.localeCompare(b.name, undefined, { numeric: true, sensitivity: 'base' }));

    for (let i = 0; i < sortedFiles.length; i += messageBatchSize) {
      const batchFiles = sortedFiles.slice(i, i + messageBatchSize);

      const files_upload = batchFiles.map(file => ({
        filename: file.name,
        file: file.path
      }));

      const privateUrls = await this.uploadFilesToSlackChannel(files_upload, comment);

      await Promise.all(privateUrls.map(async (url, index) => {
        const file = batchFiles[index];
        await updateUploadedFileReferenceWithSlackPrivateUrl(userID, sessionID, file.name, url);
      }));

      await Promise.all(batchFiles.map(file => this.deleteFile(file)));
    }
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
        file_uploads: file_uploads,
      });

      const privateUrls = response.files.flatMap((fileGroup: { files: { url_private: any; }[]; }) => 
        fileGroup.files.map((file: { url_private: any; }) => file.url_private)
      );
      return privateUrls;
    } catch (error: any) {
      console.error(`Error uploading files to Slack: ${error.message}`);
      throw error;
    } 
  }
}