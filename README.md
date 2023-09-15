# Project Name: Slack File Uploader

## Description
The Slack Upload project is an application that allows users to upload files in a specified directory to a specified Slack channel.

## Features
- File Upload: Users can select a folder from their local machine and upload th files in it to a Slack channel.
- Channel Selection: Users can specify the target Slack channel where the file should be uploaded.

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
- Create a new app and configure it with the necessary permissions. Make sure to enable the app in the channels that you want to upload files to.
- Note down the Slack App Token, it will be needed to use the SLACK API.

## 2. Set up environment variables:
- Create a .env file in the project root directory.
- Add the following environment variables to the .env file:

```
SLACK_TOKEN = "Paste your Slack Token here"
```
## 3. Change Front End Assets
- This app was designed for the use of RCCG Christ Chapel MD's Photography Team, so there are various front end elements that reflect the organization, feel free to change them to your liking.

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
6. Click the "Upload" button to upload the file to Slack.
7. Check the console logs for the upload status.

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
