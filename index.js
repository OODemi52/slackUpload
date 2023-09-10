const { WebClient, ErrorCode } = require('@slack/web-api');
const fs = require('fs');
const path = require('path');
const dotenv = require('dotenv');


dotenv.config(); // Load environment variables from .env file

const client = new WebClient(process.env.SLACK_TOKEN);
const sdCardPath = process.env.SD_CARD_PATH;

client.auth.test()
  .then((response) => {
    console.log(`App's bot user: ${response.user_id}`);
  })
  .catch((error) => {
    console.error(`Error in auth.test: ${error}`);
  });



fs.readdir(sdCardPath, (err, files) => {
  if (err) {
    console.error(`Error reading directory: ${err}`);
    return;
  }

  const pattern = new RegExp('^IMG_.+\\.JPG$');

  files.forEach((file) => {
    if (pattern.test(file)) {
      const filePath = path.join(sdCardPath, file);

      client.files.uploadV2({
        channel_id: process.env.CHANNEL_ID,
        initial_comment: "File Upload Test",
        file: fs.createReadStream(filePath),
        filename: file,
      })
      .then((response) => {
        console.log(`Uploaded ${file} to Slack`);
      })
      .catch((error) => {
        if (error.code === ErrorCode.SlackApiError) {
          console.error(`Error uploading ${file} to Slack: ${error.message}`);
        } else {
          console.error(`Unexpected error: ${error}`);
        }
      });
    }
  });
});



