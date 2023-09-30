import * as fs from 'fs';
import * as path from 'path';
import * as dotenv from 'dotenv'
import { WebClient } from '@slack/web-api';
dotenv.config();

export default class SlackBot {
  private client: WebClient;
  private sdCardPath: string;
  private dirName: string;
  private channel: string;
  private absDir: string;

  constructor(dirName?: string, channel?: string) {  // 'dirName' and 'channel' passed in from front end
    this.client = new WebClient(process.env.SLACK_TOKEN);
    this.sdCardPath = process.env.SD_CARD_PATH ?? '';
    this.dirName = dirName || '';
    this.channel = channel || '';
    this.absDir = path.join(this.sdCardPath, this.dirName);
  }

  async getChannels() {
    try {
      const result = await this.client.conversations.list();
      return result.channels?.map((channel) => [`${channel.id}`, `${channel.name}`]) ?? [];
    } catch (error) {
      console.error(error);
    }
  }

  async processFilesAndUpload(message_length: number): Promise<void> {
    const files: string[] = await this.readFilesFromDirectory();
    const sortedFiles: string[] = this.filterAndSortFiles(files);

    const files_upload: {filename: string, file: string}[] = [];

    for(let i=0; i <sortedFiles.length; i++) {
      const filename: string = sortedFiles[i];
      const file: string = path.join(this.absDir, filename);
      files_upload.push({file, filename});
      console.log(files_upload)

      if ((i + 1) % message_length === 0 || i === sortedFiles.length - 1) {
        await this.uploadFileToSlackChannel(files_upload);
        files_upload.length = 0;
      }
    }
  }

  private async readFilesFromDirectory(): Promise<string[]> {
    try {
      return await fs.promises.readdir(this.absDir);
    } catch (err) {
      console.error(`Error reading directory: ${err}`);
      throw err;
    }
  }

  private filterAndSortFiles(files: string[]): string[] {
    const pattern: RegExp = /^IMG_.+\.JPG$/;
    const filteredFiles: string[] = files.filter((file: string) => pattern.test(file));
    return filteredFiles.sort();
  }

  private async uploadFileToSlackChannel(file_uploads:object[]): Promise<void> {
    try {
      const currentDate = new Date().toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      });

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