import express from 'express';
import bodyParser from 'body-parser';
import cookieParser from 'cookie-parser';
import helmet from 'helmet';
import dbConnect from "./Config/dbConnect.config";
import apiRouter from './Routes/api.route';
import authRouter from './Routes/auth.route';
import healthRouter from './Routes/health.route';

export const app: express.Application = express();

app.use((request: express.Request, response: express.Response, next: express.NextFunction) => {
  const allowedOrigins = ["https://www.slackshots.app", "https://slackshots.app", "http://127.0.0.1:5173", "http://127.0.0.1:5174", "http://127.0.0.1:3000", "http://127.0.0.1:3001"];
  const origin = request.headers.origin as string;

  console.log('Origin:', origin);
  console.log('Is origin allowed:', allowedOrigins.includes(origin));
  
  if (allowedOrigins.includes(origin)) {
    response.setHeader('Access-Control-Allow-Origin', origin);
    response.setHeader('Access-Control-Allow-Credentials', 'true');
  }
  
  response.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS');
  response.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  
  next();
});

app.use(bodyParser.json({ limit: '50mb'}));
app.use(bodyParser.urlencoded({ limit: '50mb',extended: true }));

app.use(cookieParser());

app.use(helmet());

// API Routes
app.use('/api', apiRouter);

// Auth Routes
app.use('/auth', authRouter);

// Health Check Routes
app.use('/health', healthRouter);

// Connect to MongoDB
dbConnect();

export default app;