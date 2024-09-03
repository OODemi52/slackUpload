import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import cookieParser from 'cookie-parser';
import helmet from 'helmet';
import timeout from 'connect-timeout';
import dbConnect from "./Config/dbConnect.config";
import apiRouter from './Routes/api.route';
import authRouter from './Routes/auth.route';
import healthRouter from './Routes/health.route';

export const app: express.Application = express();


// CORS
const allowedOrigins = ["https://www.slackshots.app", "https://slackshots.app", "http://127.0.0.1:5173", "http://127.0.0.1:5174", "http://127.0.0.1:3000", "http://127.0.0.1:3001"];

app.use(cors({
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

app.use(timeout('420s'));

// Middleware
app.use(bodyParser.json({ limit: '50mb'}));
app.use(bodyParser.urlencoded({ limit: '50mb',extended: true }));
app.use(cookieParser());
app.use(helmet());

// API Routes
app.use('/api', apiRouter);
app.use('/auth', authRouter);
app.use('/health', healthRouter);

dbConnect();

export default app;