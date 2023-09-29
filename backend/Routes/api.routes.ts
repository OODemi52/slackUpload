import express from 'express';
import { getChannels, uploadFiles } from '../Controllers/api.controllers';

const router = express.Router();

// Attach HTTP methods to the various API routes:
router.get('/getChannels', getChannels);
router.post('/uploadFiles', uploadFiles);

export default router;