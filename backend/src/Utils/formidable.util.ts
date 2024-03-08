import { IncomingForm } from 'formidable';
import path from 'path';
import express from 'express';

const handleUploadedFiles = () => (request: express.Request, response: express.Response, next: express.NextFunction) => {
    const form = new IncomingForm() as any;
    
    form.uploadDir = path.join(__dirname, '../../uploads');
    form.keepExtensions = true;
    form.maxFileSize = 2000 * 1024 * 1024;
    form.maxTotalFileSize = 2000 * 1024 * 1024;

    form.parse(request, (err: any, fields: any, files: any) => {
        if (err) {
            console.error(`Error processing upload: ${err}`);
            return response.status(500).json({ error: 'Error processing upload' });
        }
        (request as any).files = files;
        next();
    });
    };

export default handleUploadedFiles;