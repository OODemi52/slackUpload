import dotenv from "dotenv";
import { ParsedFile } from "../types/file";
import { WebClient } from "@slack/web-api";
import { updateUploadedFileReferenceWithSlackPrivateUrlAndFileId } from "../Utils/db.util";

dotenv.config();

export default class SlackBot {
  private readonly channel: string;
  private readonly clientPromise: Promise<WebClient>;

  constructor(channel?: string, accessToken?: string) {
    this.channel = channel || "";
    this.clientPromise = this.setupClient(process.env.CC_SLACK_TOKEN ?? ""); // Replace with this before commiting: accessToken || ''
  }

  private async setupClient(accessToken: string): Promise<WebClient> {
    return new WebClient(accessToken);
  }

  async getChannels() {
    try {
      const client = await this.clientPromise;
      const result = await client.conversations.list();

      return await Promise.all(
        result.channels?.map(async (channel) => {
          return {
            id: channel.id,
            name: channel.name,
            isMember: channel.is_member,
          };
        }) ?? [],
      );
    } catch (error) {
      console.error(`Error fetching channels: ${error}`);
      return [];
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

  async batchAndUploadFiles(
    parsedFiles: ParsedFile[],
    userID: string,
    sessionID: string,
    messageBatchSize: number,
    comment: string,
    progressCallback?: (progress: number) => void,
  ): Promise<ParsedFile[]> {
    console.log(`Starting batch upload for session ${sessionID}`);
    const sortedFiles = parsedFiles.sort((a, b) =>
      a.name.localeCompare(b.name, undefined, {
        numeric: true,
        sensitivity: "base",
      }),
    );
    const processedFiles: ParsedFile[] = [];
    const totalFiles = sortedFiles.length;
    let processedCount = 0;

    for (let i = 0; i < sortedFiles.length; i += messageBatchSize) {
      console.log(
        `Processing batch ${i / messageBatchSize + 1} of ${Math.ceil(sortedFiles.length / messageBatchSize)}`,
      );
      const batchFiles = sortedFiles.slice(i, i + messageBatchSize);

      const files_upload = batchFiles.map((file) => ({
        filename: file.name,
        file: file.path,
      }));

      const privateUrlsAndFileIds = await this.uploadFilesToSlackChannel(
        files_upload,
        comment,
      );

      for (const [index, fileInfo] of privateUrlsAndFileIds.entries()) {
        const file = batchFiles[index];
        console.log(`Updating file reference for file: ${file.name}`);
        await updateUploadedFileReferenceWithSlackPrivateUrlAndFileId(
          userID,
          sessionID,
          file.name,
          fileInfo,
        );
        processedFiles.push(file);
        processedCount++;
        if (progressCallback) {
          progressCallback((processedCount / totalFiles) * 100);
        }
      }

      console.log(
        `Processed batch ${i / messageBatchSize + 1} of ${Math.ceil(sortedFiles.length / messageBatchSize)}`,
      );
    }

    console.log(`Batch upload completed for session ${sessionID}`);
    return processedFiles;
  }

  private async uploadFilesToSlackChannel(
    file_uploads: { filename: string; file: string }[],
    comment: string,
  ): Promise<{ id: string; url_private: string }[]> {
    try {
      const currentDate = new Date().toLocaleDateString("en-US", {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
      });

      if (!this.channel) {
        throw new Error("No channel specified");
      }

      const client = await this.clientPromise;

      const response: any = await client.files.uploadV2({
        channel_id: this.channel,
        initial_comment: comment || currentDate,
        file_uploads: file_uploads,
      });

      console.log(response.files[0]);

      return response.files.flatMap(
        (fileGroup: { files: { id: string; url_private: string }[] }) =>
          fileGroup.files.map((file: { id: string; url_private: string }) => ({
            id: file.id,
            url_private: file.url_private,
          })),
      );
    } catch (error: any) {
      console.error(`Error uploading files to Slack: ${error.message}`);
      throw error;
    }
  }
}
