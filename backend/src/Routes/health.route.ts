import express, { Router } from 'express';
import { health } from '../Controllers/health.controller';

const router: Router = express.Router();

router.get('/', health);

export default router;