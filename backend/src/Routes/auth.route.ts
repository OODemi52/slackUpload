import express, { Router } from 'express';
import { auth, callback, refresh } from '../Controllers/auth.controller';

const router: Router = express.Router();

router.get('/', auth);
router.get('/callback', callback);
router.post('/refresh', refresh);

export default router;