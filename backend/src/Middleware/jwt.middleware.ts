import { Request, Response, NextFunction } from 'express';
import jwt, { JwtPayload } from 'jsonwebtoken';
import { getParameterValue } from '../Config/awsParams.config';
import { readUser } from '../Utils/db.util';

declare module 'express-serve-static-core' {
    interface Request {
        user?: string | JwtPayload;
        userId?: string;
    }
}

export const verifyJWT = async (request: Request, response: Response, next: NextFunction) => {
  try {
    const token = request.headers.authorization?.split(' ')[1];

    if (!token) {
      return response.status(401).send('Access denied. No access token provided.');
    }

    const jwtAccessSecret = await getParameterValue('JWT_ACCESS_SECRET');

    if (!jwtAccessSecret) {
      throw new Error('JWT access secret key is missing.');
    }

    const decoded = jwt.verify(token, jwtAccessSecret) as JwtPayload;

    if (!decoded.userId) {
      return response.status(401).send('Invalid access token.');
    }

    request.user = await readUser(decoded.userId);
    request.userId = decoded.userId;
    
    next();
  } catch (error) {
    return response.status(400).send('Invalid access token.');
  }
};
