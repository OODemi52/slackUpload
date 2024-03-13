import { Request, Response, NextFunction } from 'express';
import jwt, { JwtPayload } from 'jsonwebtoken';
import { getParameterValue } from '../Config/awsParams.config';

declare module 'express-serve-static-core' {
    interface Request {
        user?: string | JwtPayload;
    }
}

export const verifyJWT = async (request: Request, response: Response, next: NextFunction) => {
  try {
    const token = request.headers.authorization?.split(' ')[1];

    if (!token) {
      return response.status(401).send('Access denied. No token provided.');
    }

    const jwtSecret = await getParameterValue('JWT_SECRET');

    if (!jwtSecret) {
      throw new Error('JWT secret key is missing.');
    }

    const decoded = jwt.verify(token, jwtSecret);
    request.user = decoded;
    next();
  } catch (error) {
    return response.status(400).send('Invalid token.');
  }
};
