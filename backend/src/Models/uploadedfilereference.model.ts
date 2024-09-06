import { Schema, Document, model } from 'mongoose';

interface IUploadedFileReference extends Document {
    name: string;
    path: string;
    size: number;
    sessionID: string;
    userID: string;
    type: string;
    lastModifiedDate?: Date;
    isUploaded: boolean;
    slackPrivateFileURL?: string;
    slackFileID?: string;
}

const uploadedFileReferenceSchema = new Schema({
    name: { type: String, required: true },
    path: { type: String, required: true },
    size: { type: Number, required: true },
    sessionID: { type: String, required: true },
    userID: { type: String, required: true },
    type: { type: String, required: true },
    lastModifiedDate: { type: Date },
    isUploaded: { type: Boolean, default: false },
    slackPrivateFileURL: { type: String },
    slackFileID: { type: String }
}, { timestamps: true });


const UploadedFileReference = model<IUploadedFileReference>('UploadedFileReference', uploadedFileReferenceSchema, 'UploadedFileReference');


export default UploadedFileReference;