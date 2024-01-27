import express from 'express';
import bodyParser from 'body-parser';
import helmet from 'helmet';
import apiRouter from './Routes/api.routes';

export const app: express.Application = express();

//Set Headers
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

//Body Parser (Gets content from response body)
app.use(bodyParser.json({ limit: '50mb'}));
app.use(bodyParser.urlencoded({ limit: '50mb',extended: true }));

//Helmet (Protect responses by setting specific headers)
//app.use(helmet());

// API Routes
app.use('/api', apiRouter);

export default app;