import express, { Router } from 'express';
import { verifyJWT } from '../Middleware/jwt.middleware';
import { api, getChannels, uploadFiles, uploadFinalFiles, getImagesUrls, getImagesProxy, deleteFiles } from '../Controllers/api.controller';

const router: Router = express.Router();

router.get('/', api);
router.get('/getChannels', verifyJWT, getChannels);
router.post('/uploadFiles', verifyJWT,/*handleUploadedFiles(),*/ uploadFiles);
router.post('/uploadFinalFiles', verifyJWT,/*handleUploadedFiles(),*/ uploadFinalFiles);
router.get('/getImagesUrls', verifyJWT,/*handleUploadedFiles(),*/ getImagesUrls);
router.get('/getImagesProxy', verifyJWT,/*handleUploadedFiles(),*/ getImagesProxy);
router.delete('/deleteFiles', verifyJWT,/*handleUploadedFiles(),*/ getImagesProxy);

export default router;