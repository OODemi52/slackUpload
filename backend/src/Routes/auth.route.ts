import express, { Router } from 'express';
import { auth, callback } from '../Controllers/auth.controller';

const router: Router = express.Router();

router.get('/', auth);
router.get('/callback', callback);

export default router;