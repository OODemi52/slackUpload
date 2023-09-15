import { WebClient, ErrorCode, ConversationsInfoArguments } from '@slack/web-api';
import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';
import express, { json } from 'express';
import bodyParser from 'body-parser';
import helmet from 'helmet';

// Load environment variables from .env file
dotenv.config();

const client: WebClient = new WebClient(process.env.SLACK_TOKEN);
const sdCardPath: string = process.env.SD_CARD_PATH ?? '';
const app: express.Application = express();
const port: number = 3000;

// Initiaize Server
app.listen(port, () => console.log(`Running on port ${port}`));

//Set Headers
app.use((request: express.Request, response: express.Response, next) => {
  response.setHeader("Access-Control-Allow-Origin", "*");
  response.setHeader(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content, Accept, Content-Type, Authorization"
  );
  response.setHeader(
    "Access-Control-Allow-Methods",
    "GET, POST, PUT, DELETE, PATCH, OPTIONS"
  );
  next();
});

//Body Parser (Gets content from response body)
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

//Helmet (Protect responses by setting specific headers)
app.use(helmet());

app.get("/api", (request: express.Request, response: express.Response) => {
  response.json({ message: "Server online!" });
  // http://localhost:3000 to check if server is responding
});

app.get("/api/getChannels", (request: express.Request, response: express.Response) => {
  client.conversations.list()
  .then((result) => {
    let allChannels: string[][] = result.channels?.map((channel) => [`${channel.id}`, `${channel.name}`]) ?? [];
      console.log(allChannels);
      response.json(allChannels);
  })
  .catch((error) => {
    console.error(error);
    response.status(500).json({error: "Failed to retrieve channels"});
  })
})

app.post("/api/uploadFiles", (request: express.Request, response: express.Response) => {
  
  interface UploadObject {
    channel: string,
    dir: string
  }

  let { channel, dir}: UploadObject = request.body;
  
  client.auth.test()
  .then((response) => {
    console.log(`App's bot user: ${response.user_id}`);
  })
  .catch((error) => {
    console.error(`Error in auth.test: ${error}`);
  });



  fs.readdir(sdCardPath, (err, files: string[]) => {
    if (err) {
      console.error(`Error reading directory: ${err}`);
      return;
    }

    const pattern: RegExp = new RegExp('^IMG_.+\\.JPG$');

    files.forEach((file: string) => {
      if (pattern.test(file)) {
        const filePath: string = path.join(sdCardPath, file);

        client.files.uploadV2({
          channel_id: channel,
          initial_comment: "File Upload Test",
          file: fs.createReadStream(filePath),
          filename: file,
        })
        .then((response) => {
          console.log(`Uploaded ${file} to Slack`);
        })
        .catch((error) => {
          if (error.code === 'slack_error_code') {
            console.error(`Error uploading ${file} to Slack: ${error.message}`);
          } else {
            console.error(`Unexpected error: ${error}`);
          }
        });
      }
    });
  });
});





