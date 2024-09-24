import express, { Router } from 'express';
import { verifyJWT } from '../Middleware/jwt.middleware';
import { api, getChannels, uploadFiles, uploadFinalFiles, getImagesUrls, getImagesProxy, deleteFiles, downloadFiles, addBotToChannel, uploadProgress } from '../Controllers/api.controller';

const router: Router = express.Router();

router.get('/', api);
router.get('/getChannels', verifyJWT, getChannels);
router.post('/uploadFiles', verifyJWT, uploadFiles);
router.post('/uploadFinalFiles', verifyJWT, uploadFinalFiles);
router.get('/getImagesUrls', verifyJWT, getImagesUrls);
router.get('/getImagesProxy', verifyJWT, getImagesProxy);
router.delete('/deleteFiles', verifyJWT, deleteFiles);
router.post('/downloadFiles', verifyJWT, downloadFiles);
router.post('/addBotToChannel', verifyJWT, addBotToChannel);
router.post('/uploadProgress', verifyJWT, uploadProgress);

export default router;