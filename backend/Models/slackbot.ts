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
    this.dirName = dirName || ''; // Makes it optional to pass args in for class methods that dont require it.
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

  async processFilesAndUpload(): Promise<void> {
    const files: string[] = await this.readFilesFromDirectory();
    const sortedFiles: string[] = this.filterAndSortFiles(files);
  
    for (const fileName of sortedFiles) {
      await this.uploadFileToSlackChannel(fileName, this.absDir);
      // Introduce a delay of, for example, 2.5 second between uploads
      await new Promise((resolve) => setTimeout(resolve, 2500));
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

  private async uploadFileToSlackChannel(fileName: string, filePath:string): Promise<void> {
    try {
     await this.client.files.uploadV2({
       channel_id: this.channel,
       initial_comment: "Sunday September 17, 2023",
       file: fs.createReadStream(path.join(filePath, fileName)),
       filename: fileName,
     });
     console.log(`Uploaded ${fileName} to Slack`);
   } catch (error: any) {
     if (error.code === 'slack_error_code') {
       console.error(`Error uploading ${fileName} to Slack: ${error.message}`);
     } else {
       console.error(`Unexpected error: ${error}`);
     }
     throw error;
   } 
 }
}