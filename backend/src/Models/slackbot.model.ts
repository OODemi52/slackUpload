import dotenv from 'dotenv';
import { ParsedFile } from '../types/file';
import { WebClient } from '@slack/web-api';
import { updateUploadedFileReferenceWithSlackPrivateUrlAndFileId } from '../Utils/db.util';

dotenv.config();

export default class SlackBot {
  private channel: string;
  private clientPromise: Promise<WebClient>;

  constructor(channel?: string, accessToken?: string) {
    this.channel = channel || '';
    this.clientPromise = this.setupClient(accessToken || '');
  }

  private async setupClient(accessToken: string): Promise<WebClient> {
    return new WebClient(accessToken);
  }

  async getChannels() {
    try {
      const client = await this.clientPromise;
      const result = await client.conversations.list();
      const botId = (await client.auth.test()).bot_id;

      const channels = await Promise.all(result.channels?.map(async (channel) => {
        const isMember = channel.id && botId ? await this.isBotMemberOfChannel(channel.id, botId) : false;
        return {
          id: channel.id,
          name: channel.name,
          isMember: isMember
        };
      }) ?? []);
      console.log(`Fetched channels from bot: ${channels}`);
      return channels;
    } catch (error) {
      console.error(`Error fetching channels: ${error}`);
      return [];
    }
  }

  async isBotMemberOfChannel(channelId: string, botId: string) {
    try {
      const members = await (await this.clientPromise).conversations.members({ channel: channelId });
      return members.members?.includes(botId);
    } catch (error) {
      console.error(`Error checking bot membership: ${error}`);
      return false;
    }
  }

  async addBotToChannel(channelId: string) {
    try {
      const client = this.clientPromise;
      await (await client).conversations.join({ channel: channelId });
    } catch (error) {
      console.error(`Error adding bot to channel: ${error}`);
      throw error;
    }
  }

  async deleteFilesFromSlack(fileIDs: any): Promise<void> {
    try {
      const client = await this.clientPromise;
      console.log(`Deleting files: ${fileIDs}`);
      
      for (const fileID of fileIDs) {
        await client.files.delete({
          file: fileID,
        });
        console.log(`Deleted file with ID: ${fileID}`);
      }
      
    } catch (error) {
      console.error(`Error deleting files: ${error}`);
      throw error;
    }
  }

  async batchAndUploadFiles(parsedFiles: ParsedFile[], userID: string, sessionID: string, messageBatchSize: number, comment: string): Promise<ParsedFile[]> {
    const sortedFiles = parsedFiles.sort((a, b) => a.name.localeCompare(b.name, undefined, { numeric: true, sensitivity: 'base' }));
    const processedFiles: ParsedFile[] = [];
    
  
    for (let i = 0; i < sortedFiles.length; i += messageBatchSize) {
      const batchFiles = sortedFiles.slice(i, i + messageBatchSize);
  
      const files_upload = batchFiles.map(file => ({
        filename: file.name,
        file: file.path
      }));
  
      const privateUrlsAndFileIds = await this.uploadFilesToSlackChannel(files_upload, comment);
  
      await Promise.all(privateUrlsAndFileIds.map(async (fileInfo, index) => {
        const file = batchFiles[index];
        console.log(`Updating file reference for file: ${file.name}`);
        await updateUploadedFileReferenceWithSlackPrivateUrlAndFileId(userID, sessionID, file.name, fileInfo);
        processedFiles.push(file);
      }));
  
      console.log(`Processed batch ${i / messageBatchSize + 1} of ${Math.ceil(sortedFiles.length / messageBatchSize)}`);
    }
  
    return processedFiles;
  }
  
  private async uploadFilesToSlackChannel(file_uploads: { filename: string, file: string }[], comment: string): Promise<{ id: string; url_private: string; }[]> {
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

      const privateUrlsWithFileIds = response.files.flatMap((fileGroup: { files: { id: string; url_private: string; }[] }) =>
        fileGroup.files.map((file: { id: string; url_private: string; }) => ({
          id: file.id,
          url_private: file.url_private
        }))
      );
      
      return privateUrlsWithFileIds;

    } catch (error: any) {
      console.error(`Error uploading files to Slack: ${error.message}`);
      throw error;
    } 
  }
}