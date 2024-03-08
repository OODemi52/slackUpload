import express, { Router } from 'express';
import { api, getChannels, uploadFiles, uploadFinalFiles, getImagesUrls, getImagesProxy } from '../Controllers/api.controller';
import handleUploadedFiles from '../Utils/formidable.util';

const router: Router = express.Router();

router.get('/', api);
router.get('/getChannels', getChannels);
router.post('/uploadFiles', /*handleUploadedFiles(),*/ uploadFiles);
router.post('/uploadFinalFiles', /*handleUploadedFiles(),*/ uploadFinalFiles);
router.get('/getImagesUrls', /*handleUploadedFiles(),*/ getImagesUrls);
router.get('/getImagesProxy', /*handleUploadedFiles(),*/ getImagesProxy);

export default router;