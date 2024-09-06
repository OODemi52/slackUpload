  export interface File {
    size: number;
    lastModifiedDate?: Date;
  }

  export interface UploadedFile extends File {
    originalFilename: string;
    filepath: string;
    mimetype: string;
  }
  
  export interface ParsedFile extends File {
    name: string;
    path: string;
    sessionID: string;
    userID: string;
    type: string;
    isUploaded: boolean;
  }