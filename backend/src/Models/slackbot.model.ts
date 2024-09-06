import dotenv from 'dotenv';
import { ParsedFile } from '../types/file';
import { WebClient } from '@slack/web-api';
import { updateUploadedFileReferenceWithSlackPrivateUrlAndFileId } from '../Utils/db.util';

dotenv.config();

export default class SlackBot {
  private channel: string;
  private clientPromise: Promise<WebClient>;

  constructor(channel?: string, accessToken?: string) {
    this.channel = channel || ''
    this.clientPromise = this.setupClient(accessToken);
  }

  private async setupClient(accessToken: string | undefined): Promise<WebClient> {
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

  private async deleteFile(file: ParsedFile): Promise<void> {}

  async batchAndUploadFiles(parsedFiles: ParsedFile[], userID: string, sessionID: string, messageBatchSize: number, comment: string): Promise<ParsedFile[]> {
    const sortedFiles = parsedFiles.sort((a, b) => a.name.localeCompare(b.name, undefined, { numeric: true, sensitivity: 'base' }));
    const processedFiles: ParsedFile[] = [];
    
  
    for (let i = 0; i < sortedFiles.length; i += messageBatchSize) {
      const batchFiles = sortedFiles.slice(i, i + messageBatchSize);
      console.log(`Processing batch ${i / messageBatchSize + 1} with ${batchFiles.length} files`);
  
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

      console.log('Response', response.files[0].files[0].id);

      const privateUrlsWithFileIds = response.files.flatMap((fileGroup: { files: { id: string; url_private: string; }[] }) =>
        fileGroup.files.map((file: { id: string; url_private: string; }) => ({
          id: file.id,
          url_private: file.url_private
        }))
      );

      console.log('Private URLs with file IDs', privateUrlsWithFileIds);
      
      return privateUrlsWithFileIds;

    } catch (error: any) {
      console.error(`Error uploading files to Slack: ${error.message}`);
      throw error;
    } 
  }
}