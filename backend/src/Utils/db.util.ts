import mongoose from "mongoose";
import { getParameterValue } from "../Config/awsParams.config";
import UploadedFileReference from "../Models/uploadedfilereference.model";


// Want to implemet crud methods
/* Currently needs to be implemented (delete as you go) :
    - writeUser
    - writeUserPreferences
    - readUser
    - readUserPreferences


    Implement in the future
    - updateUploadedFile
    - deleteUploadedFile
    - readAllSizes
    - readAllUsers
    etc.
*/

export const writeUploadedFileReference = async (fileDetails: any) => {
    try {
      const fileReference = new UploadedFileReference(fileDetails);
      await fileReference.save();
      console.log('File reference saved successfully');
    } catch (error) {
      console.error('Error saving file reference:', error);
      throw error;
    }
  };

export const readAllUploadedFileReferencesBySession = async (sessionID: string) => {
   console.log('Reading file references for session: ', sessionID);
    try {
        const fileReferences = await UploadedFileReference.find({ sessionID });
        return fileReferences;
    } catch (error) {
        console.error('Error reading file references:', error);
        throw error;
    }
};

export const updateUploadedFileReferenceWithSlackPrivateUrl = async (userID: string, sessionID: string, fileName: string, url: string) => {
  try {
      const updated = await UploadedFileReference.findOneAndUpdate(
          { userID, sessionID, name: fileName },
          { $set: { slackPrivateFileURL: url } },
          { new: true }
      );
      if (updated) {
          console.log(`Updated file reference with URL for file: ${fileName}`);
      } else {
          console.log(`No matching file reference found for file: ${fileName}`);
      }
  } catch (error) {
      console.error('Error updating file reference with URL:', error);
      throw error;
  }
};

export const paginateSlackPrivateUrls = async (userID: string, page: number = 1, limit: number = 10) => {
  try {
    const skip = (page - 1) * limit;
    const slackPrivateFileUrls = await UploadedFileReference.find({ userID, slackPrivateFileURL: { $ne: null } })
      .sort({ updatedAt: -1 })
      .skip(skip)
      .limit(limit);

    return slackPrivateFileUrls;
  } catch (error) {
    console.error('Error reading file references:', error);
    throw error;
  }
}
