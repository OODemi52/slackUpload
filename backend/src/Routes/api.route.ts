import express, { Router } from 'express';
import { verifyJWT } from '../Middleware/jwt.middleware';
import { api, getChannels, uploadFinalFiles, getImagesUrls, getImagesProxy, deleteFiles, downloadFiles, addBotToChannel, uploadProgress, finalizeUpload } from '../Controllers/api.controller';

const router: Router = express.Router();

router.get('/', api);

if (process.env.NODE_ENV !== 'development') {
    router.get('/getChannels', verifyJWT, getChannels);
    router.post('/finalizeUpload', verifyJWT, finalizeUpload);
    router.post('/uploadFinalFiles', verifyJWT, uploadFinalFiles);
    router.get('/getImagesUrls', verifyJWT, getImagesUrls);
    router.get('/getImagesProxy', verifyJWT, getImagesProxy);
    router.delete('/deleteFiles', verifyJWT, deleteFiles);
    router.post('/downloadFiles', verifyJWT, downloadFiles);
    router.post('/addBotToChannel', verifyJWT, addBotToChannel);
    router.post('/uploadProgress', verifyJWT, uploadProgress);
  } else {
    router.get('/getChannels', getChannels);
    router.post('/finalizeUpload', finalizeUpload);
    router.post('/uploadFinalFiles', uploadFinalFiles);
    router.get('/getImagesUrls', getImagesUrls);
    router.get('/getImagesProxy', getImagesProxy);
    router.delete('/deleteFiles', deleteFiles);
    router.post('/downloadFiles', downloadFiles);
    router.post('/addBotToChannel', addBotToChannel);
    router.post('/uploadProgress', uploadProgress);
  }

export default router;