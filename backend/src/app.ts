import cors from 'cors';
import helmet from 'helmet';
import express from 'express';
import tusServer from './tusServer'
import bodyParser from 'body-parser';
import timeout from 'connect-timeout';
import cookieParser from 'cookie-parser';
import apiRouter from './Routes/api.route';
import authRouter from './Routes/auth.route';
import healthRouter from './Routes/health.route';
import dbConnect from "./Config/dbConnect.config";
import { verifyJWT } from './Middleware/jwt.middleware';


export const app: express.Application = express();

// CORS
const allowedOrigins = ["https://www.slackshots.app", "https://slackshots.app", "http://localhost:5173", "http://127.0.0.1:5173"];

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
  allowedHeaders: ['Content-Type', 'Authorization', 'Tus-Resumable', 'Upload-Length', 'Upload-Metadata', 'Upload-Offset'],
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

// Mount TUS server
app.all(
  '/files*', 
  process.env.NODE_ENV !== 'development' ? verifyJWT : (_request, _response, next) => next(), 
  (request, response) => {
    console.log(`Endpoint /files* hit with method ${request.method} at ${new Date().toISOString()}`);
    tusServer.handle(request, response); 
  }
);

// Start DB connection
void dbConnect();

export default app;