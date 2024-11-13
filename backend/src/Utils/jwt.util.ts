/*

// To create a JWT secret, run the following:

const crypto = require('crypto');
const secret = crypto.randomBytes(64).toString('hex');
console.log('Your JWT secret is:', secret);

*/

import jwt from 'jsonwebtoken';
import { getParameterValue } from '../Config/awsParams.config';

export const generateToken = async (userId: string, type: 'access' | 'refresh') => {
    if (!userId) {
        console.error('User ID is required to generate a token');
        return undefined;
    }

    let secretKey;
    let expiresIn;

    try {
        if (type === 'access') {
            secretKey = await getParameterValue('JWT_ACCESS_SECRET');
            expiresIn = '1h';
        } else {
            secretKey = await getParameterValue('JWT_REFRESH_SECRET');
            expiresIn = '14d';
        }

        if (!secretKey) {
            console.error(`JWT secret key for ${type} token is missing`);
            return undefined;
        }

        const payload = { userId };
        const options = { expiresIn };
        return jwt.sign(payload, secretKey, options);

    } catch (error) {
        console.error(`Error generating JWT for ${type} token:`, error);
        return undefined;
    }
};

export const decodeToken = async (refreshToken: string) => {

    if (!refreshToken) {
        console.error('Token is required to decode.');
        return undefined;
    }

    try {
        const secretKey = await getParameterValue('JWT_REFRESH_SECRET');

        if (!secretKey) {
            throw new Error('JWT secret key is missing.');
        }

        return jwt.verify(refreshToken, secretKey);

    } catch (error) {
        if (error instanceof jwt.TokenExpiredError) {
            console.error('Refresh token expired:', error);

        } else {
            console.error('Error validating refresh token:', error);
        }
        return undefined;
    }
}