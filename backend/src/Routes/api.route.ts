import express, { Router } from 'express';
import { api, getChannels, uploadFiles } from '../Controllers/api.controller';

const router: Router = express.Router();

router.get('/', api);
router.get('/getChannels', getChannels);
router.post('/uploadFiles', uploadFiles);

export default router;