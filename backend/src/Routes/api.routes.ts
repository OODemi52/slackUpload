import express, { Router } from 'express';
import { getChannels, uploadFiles } from '../Controllers/api.controllers';

const router: Router = express.Router();

router.get('/getChannels', getChannels);
router.post('/uploadFiles', uploadFiles);

export default router;