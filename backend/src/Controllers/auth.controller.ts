import express from 'express';
import axios from 'axios';
import dotenv from 'dotenv';
import { getParameterValue, setParameterValue } from '../Config/awsParams.config';
import { writeUser, updateWithRefreshToken, readUser, invalidateRefreshToken } from '../Utils/db.util';
import { generateToken, decodeToken } from '../Utils/jwt.util';

dotenv.config();

interface SlackOAuthResponse {
  ok: boolean;
  access_token: string;
  token_type: string;
  scope: string;
  bot_user_id: string;
  app_id: string;
  team?: Team;
  authed_user?: AuthedUser;
  enterprise?: Enterprise
  error?: string;
}

interface Team {
  id?: string | null;
  name?: string | null;
}

interface Enterprise {
  id?: string;
  name?: string;
}

interface AuthedUser {
  id?: string | null;
  scope?: string | null;
  access_token?: string | null;
  token_type?: string | null;
}
  
export const auth = async (request: express.Request, response: express.Response) => {
  response.status(400).send('Something went wrong, you should not be here!');
}

export const callback = async (request: express.Request, response: express.Response) => {
  const { code } = request.query;

  if (!code) {
    return response.status(400).send('Code is missing!');
  }

  try {
    const clientId = await getParameterValue('SLACK_CLIENT_ID');
    const clientSecret = await getParameterValue('SLACK_CLIENT_SECRET');

    if (!clientId || !clientSecret) {
      return response.status(400).send('Client ID or Client secret is missing!');
    }

    const tokenResponse = await axios.post<SlackOAuthResponse>('https://slack.com/api/oauth.v2.access', null, {
      params: {
        client_id: clientId,
        client_secret: clientSecret,
        code,
      },
    });

    if (tokenResponse.data.ok) {
      const { access_token, token_type, scope, bot_user_id, app_id, team, enterprise, authed_user } = tokenResponse.data;

      await setParameterValue(`SLA_IDAU${authed_user?.id}IDT${team?.id}`, access_token);

      const userAuthData = {
        tokenType: token_type,
        scope: scope,
        botUserId: bot_user_id,
        appId: app_id,
        team: team ? { name: team.name || undefined, id: team.id || undefined } : undefined,
        enterprise: enterprise ? { name: enterprise.name, id: enterprise.id } : undefined,
        authedUser: authed_user ? {
          id: authed_user.id || undefined,
          scope: authed_user.scope || undefined,
          token_type: authed_user.token_type || undefined,
        } : undefined,
      };

      const userDoc = await writeUser(userAuthData);

      const accessToken = await generateToken(userDoc._id.toString(), 'access');
      const refreshToken = await generateToken(userDoc._id.toString(), 'refresh');

      await updateWithRefreshToken(userDoc._id.toString(), refreshToken);

      response.cookie('refreshToken', refreshToken, {
        httpOnly: true,
        secure: true,
        sameSite: 'lax', // Lax due to limitations of Safari browser, look into workaround
        path: '/',
        maxAge: 14 * 24 * 60 * 60 * 1000,
      });

      const clientHost = await getParameterValue('CLIENT_HOST');
      const clientProtocol = await getParameterValue('CLIENT_PROTOCOL');

      const clientRedirectUrl = `${clientProtocol}://${clientHost}/authCallback?accessToken=${accessToken}`;

      return response.redirect(clientRedirectUrl);
    } else {
      console.error('Error obtaining access token:', tokenResponse.data.error);
      return response.status(500).send(`Error obtaining access token: ${tokenResponse.data.error}`);
    }
  } catch (error) {
    console.error('Error during token exchange:', error);
    return response.status(500).send('Internal Server Error');
  }
};

export const refresh = async (request: express.Request, response: express.Response) => {
  const refreshToken = request.cookies.refreshToken;

  if (!refreshToken) {
    return response.status(401).send('Refresh token is missing');
  }

  try {
    const decoded = await decodeToken(refreshToken);

    const user = await readUser((decoded as any).userId);

    const valid = user.userData.refreshToken === refreshToken;

    if (!valid) {
      return response.status(401).send('Invalid refresh token');
    }

    const newAccessToken = await generateToken((decoded as any).userId, 'access');
    
    return response.status(200).send({ accessToken: newAccessToken });
  } catch (error) {
    console.log("Error refreshng token:", error);
    return response.status(400).send('Invalid refresh token');
  }
}

export const logout = async (request: express.Request, response: express.Response) => {
  const refreshToken = request.cookies.refreshToken;

  if (!refreshToken) {
    return response.status(400).send('Refresh token is missing');
  }

  try {
    const decoded = await decodeToken(refreshToken);
    const userId = (decoded as any).userId;
    
    const user = await readUser(userId);
    const valid = user.userData.refreshToken === refreshToken;

    if (!valid) {
      return response.status(401).send('Invalid refresh token');
    }

    response.clearCookie('refreshToken', {
      httpOnly: true,
      secure: true,
      sameSite: 'lax',
      path: '/',
    });

    await invalidateRefreshToken(userId);

    return response.status(200).send('Logged out successfully');
  } catch (error) {
    console.log('Error during logout:', error);
    return response.status(500).send('Internal Server Error');
  }
}