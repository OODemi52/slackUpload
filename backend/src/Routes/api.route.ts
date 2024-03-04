import express, { Router } from 'express';
import { api, getChannels, uploadFiles, uploadFinalFiles } from '../Controllers/api.controller';
import handleUploadedFiles from '../Utils/formidable.util';

const router: Router = express.Router();

router.get('/', api);
router.get('/getChannels', getChannels);
router.post('/uploadFiles', /*handleUploadedFiles(),*/ uploadFiles);
router.post('/uploadFinalFiles', /*handleUploadedFiles(),*/ uploadFinalFiles);

export default router;