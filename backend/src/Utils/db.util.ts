import UploadedFileReference from "../Models/uploadedfilereference.model";
import User from "../Models/user.model";


// Want to implemet crud methods
/* Currently needs to be implemented (delete as you go) :
    - writeUser
    - readUser


    Implement in the future
    - updateUploadedFile
    - deleteUploadedFile
    - readAllSizes
    - readAllUsers
    etc.
*/

interface UserAuthData {
  tokenType: string;
  scope: string;
  botUserId: string;
  appId: string;
  team?: {
    name?: string;
    id?: string;
  };
  enterprise?: {
    name?: string;
    id?: string;
  };
  authedUser?: {
    id?: string;
    scope?: string;
    accessToken?: string;
    tokenType?: string;
  };
  refreshToken?: string;
}

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

export const writeUser = async (userAuthData: UserAuthData) => {
  const { tokenType, scope, botUserId, appId, team, enterprise, authedUser } = userAuthData;
  const userDoc = await User.findOneAndUpdate(
    { 'authedUser.id': authedUser?.id, 'team.id': team?.id }, 
    userAuthData, 
    { new: true, upsert: true }
  );
  return userDoc;
};


export const readUser = async (userId: string, teamId: string) => {
  try {
    const user = await User.findOne({ slackUserId: userId, teamID: teamId });
    if (!user) {
      throw new Error('User not found');
    }
    return user;
  } catch (error) {
    console.error('Error reading user:', error);
    throw error;
  }
};

export const updateWithRefreshToken  = async (userId: string, refreshToken: string | undefined) => {
  try {
    await User.findOneAndUpdate({ _id: userId }, { refreshToken })
  } catch (error) {
    console.error('Error updating user with refresh token:', error);
    throw error;
  }
}

export const readToken = async (userId: string) => {

  try {
    const token = await User.findOne({ _id: userId });

    if (!token) {
      throw new Error('Token not found');
    }

    return token;
  } catch (error) {
    console.error('Error reading token:', error);
    throw error;
  }
}