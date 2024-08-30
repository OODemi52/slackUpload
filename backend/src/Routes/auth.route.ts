import express, { Router } from 'express';
import { auth, callback, refresh, logout } from '../Controllers/auth.controller';

const router: Router = express.Router();

router.get('/', auth);
router.get('/callback', callback);
router.post('/refresh', refresh);
router.post('/logout', logout );

export default router;