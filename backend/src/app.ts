import express from 'express';
import bodyParser from 'body-parser';
import cookieParser from 'cookie-parser';
import helmet from 'helmet';
import cors from 'cors';
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

// CORS (Cross-Origin Resource Sharing) allowing requests from designated frontends
app.use(cors({
  origin: ["https://slackshots.onrender.com", "http://localhost:5173", "http://localhost:5174", "http://localhost:3000", "http://localhost:3001"]
}
))
app.options('*', cors())

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