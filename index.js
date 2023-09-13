const { WebClient, ErrorCode } = require('@slack/web-api');
const fs = require('fs');
const path = require('path');
const dotenv = require('dotenv');
const express = require('express');
const bodyParser = require('body-parser');
const helmet = require('helmet')
dotenv.config(); // Load environment variables from .env file
const client = new WebClient(process.env.SLACK_TOKEN);
const sdCardPath = process.env.SD_CARD_PATH;
const app = express();
const port = 3000;


// Initiaize Server
app.listen(port, () => console.log(`Running on port ${port}`));

//Set Headers
app.use((request, response, next) => {
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

/*
function channelIter () {
  let allChannels = result.channels
  const ids = names = {};

  for (let i=0; i<length(allChannels); i++) {
    ids[`id${i}`] = result.channels[i].id
    names[`name${i}`] = result.channels[i].name
  }
}
*/




app.get("/api", (request, response) => {
  response.json({ message: "Server online!" });
  // http://localhost:3000 to check if server is responding
});



app.get("/api/getChannels", (request, response) => {
  client.conversations.list()
  .then((result) => {
    let allChannels = result.channels
    const obj = {}
    const arr = []
    for (let i=0; i<allChannels.length; i++) {
      arr[i] = [result.channels[i].id, result.channels[i].name]
    }
    console.log(arr)
    response.json(arr)
  })
  .catch((error) => {
    console.error(error);
  })
})

    

app.post("/api/uploadFiles", (request, response) => {
  let { channel, dir } = request.body
  
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
        channel_id: channel,
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
});





