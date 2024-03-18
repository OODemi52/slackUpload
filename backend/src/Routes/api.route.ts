import express, { Router } from 'express';
import { api, getChannels, uploadFiles, uploadFinalFiles, getImagesUrls, getImagesProxy } from '../Controllers/api.controller';
import { verifyJWT } from '../Middleware/jwt.middleware';
import handleUploadedFiles from '../Utils/formidable.util';

const router: Router = express.Router();

router.get('/', api);
router.get('/getChannels', verifyJWT, getChannels);
router.post('/uploadFiles', verifyJWT,/*handleUploadedFiles(),*/ uploadFiles);
router.post('/uploadFinalFiles', verifyJWT,/*handleUploadedFiles(),*/ uploadFinalFiles);
router.get('/getImagesUrls', verifyJWT,/*handleUploadedFiles(),*/ getImagesUrls);
router.get('/getImagesProxy', verifyJWT,/*handleUploadedFiles(),*/ getImagesProxy);

export default router;