# Project Name: Slack Image Uploader

## Description
The Slack Upload project is an application that allows users to upload images in a specified directory to a specified Slack channel.

## Features
- Image Upload: Users can select a folder from their local machine and upload the images in it to a Slack channel.
- Channel Selection: Users can specify the target Slack channel where the images should be uploaded.

## Technologies Used
### Node.js - As the Javascript runtime.
### Express.js - To create the APIs consumed by the front end of the application.
### React.js - To build the front end of the application.
### Helmet.js - To provide an added level of security for the APIs.
### Typescript - To provide type safety in the code.
### fs (File System) Module - To allow interaction between the runtime and the machines OS file system.
### dotenv Module - To get environment variables.
### Slack Web API - To enable communicate with the orginzations Slack channels through the use of a Slack bot.

## Installation
1. Clone the repository: ```git clone https://github.com/OODemi52/slackUpload```.
2. Navigate to the project directory: ```cd slackUpload```.
3. Install dependencies: ```npm install```.

## Configuration
### 1. Create a Slack App:
- Go to the Slack API website: https://api.slack.com/.
- Create a new app and configure it with the necessary permissions. Make sure to enable the app in the channels that you want to upload the images to.
- Note down the Slack App Token, it will be needed to use the SLACK API.

### 2. Set up environment variables:
- Create a .env file in the project root directory.
- Add the following environment variables to the .env file:

```
SLACK_TOKEN = "Paste your Slack Token here"
```
### 3. Change Front End Assets
- This app was designed for the use of RCCG Christ Chapel MD's Photography Team, so there are various front end elements that reflect the organization, feel free to change them to your liking.

### 4. Image Regex
-In the index.ts file, there is a regular expression (regex) used to filter the files in a folder that are uploaded. For CCMD, we only upload JPEG images so the regex filters for files the begin with "IMG" and ends with ".JPG": 
```
const pattern: RegExp = new RegExp('^IMG_.+\\.JPG$');
```
If you need to upload files that do not follow this structure, feel free to change the regex, or remove it entirely if you need to upload all files in said folder.

## Usage
### Start API Server
1. Navigate to the backend directory: ```cd backend```.
2. Start the API server using the start command: ```npm start```.

### Start React Server
1. Navigate back to slackUpload folder: ```cd ..```.
2. Navigate to the frontend directory: ```cd frontend```.
3. Start the React server using the start command: ```npm run dev```.
4. Open your web browser using the link provided in the terminal (e.g. http:localhost:5174).

### Uploading Flies
3. Select a directory using the "Choose File" input field.
4. Choose the target Slack channel from the dropdown menu.
6. Click the "Upload" button to upload the images to Slack.
7. Check the console logs for the upload status.

## Current Roadblocks
- Due to Javascript security protocols for working with the browser, choosing the directory on the web page does not retrive the absolute file path of the folder, which is needed on the backend to determine where to check to upload files. To work around this, the root of the file path you plan to use needs to be set in the .env file. For example if the absolute path of your file is ```"/Volumes/EOS_DIGITAL/DCIM/102CANON"``` your .env variable would be:
```
SD_CARD_PATH = "/Volumes/EOS_DIGITAL/DCIM"
```
the ```102CANON``` folder would be selected throgh the web pages file selection. Workarounds for selecting the folder path are being explored. This might involve porting the application to a desktop application using something like Electron. If you have any feedback or ides, feel free to share or fork this repository.
- When using the Slack app, you can upload photos up to 10 at a time, but through the API you can only upload 1 image at a time. Uploading the images 10 at a time is more beneficial because it groups the photos together and makes it easier to go through them. A workaround using permalinks to group the images together and upload them is being worked on.

## Coming Features
- Selecting absolute file path.
- Uploading images 10 at a time.
- A UI feature that will display the uploaded photos in a grid as they are uploaded, and allow users to view details, download specific images, and delete images from a channel.
- Optional authentification to limit use to those within organization.
- Authentication method to prevent abuse from client side.
- Option to decide what comment will accompany each message.

## Contributing
Contributions are welcome! If you would like to contribute to this project, please follow these steps:
1. Fork the repository.
2. Create a new branch: ```git checkout -b feature/your-feature-name```.
3. Make your changes and commit them: ```git commit -m "Add some feature"```.
4. Push to the branch: ```git push origin feature/your-feature-name```.
5. Submit a pull request.

## License
This project is licensed under the MIT License.

## Contact
For any inquiries or suggestions, please contact the project maintainer:
- Name: Demilade Daniel-Akanle
- Email: demidaniel98@gmail.com

Feel free to reach out with any questions or feedback. Thank you for using the Slack Upload project!