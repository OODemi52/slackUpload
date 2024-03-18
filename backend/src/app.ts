import express from 'express';
import bodyParser from 'body-parser';
import cookieParser from 'cookie-parser';
import helmet from 'helmet';
import dbConnect from "./Config/dbConnect.config";
import apiRouter from './Routes/api.route';
import authRouter from './Routes/auth.route';
import healthRouter from './Routes/health.route';

export const app: express.Application = express();

//Set Response Headers
app.use((request: express.Request, response: express.Response, next) => {
  response.setHeader("Access-Control-Allow-Origin", "*");
  response.setHeader(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content, Accept, Content-Type, Authorization"
  );
  response.setHeader(
    "Access-Control-Allow-Methods",
    "GET, POST, PUT, DELETE, PATCH, OPTIONS"
  );
  next();
});

// Body Parser (Gets content from response body)
app.use(bodyParser.json({ limit: '50mb'}));
app.use(bodyParser.urlencoded({ limit: '50mb',extended: true }));

// Cookie Parser (Parses cookies from request headers)
app.use(cookieParser());

// CORS (Cross-Origin Resource Sharing) allowing requests from designated client origins
app.use((request: express.Request, response: express.Response, next: express.NextFunction) => {
  const allowedOrigins = ["https://slackshots.app", "http://127.0.0.1:5173", "http://127.0.0.1:5174", "http://127.0.0.1:3000", "http://127.0.0.1:3001"];
  const origin = request.headers.origin as string;
  
  if (allowedOrigins.includes(origin)) {
    response.setHeader('Access-Control-Allow-Origin', origin);
    response.setHeader('Access-Control-Allow-Credentials', 'true');
  }
  
  response.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS');
  response.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  
  next();
});

// Helmet (Protect responses by setting specific security-focused headers)
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