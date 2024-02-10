import express from 'express';
import axios from 'axios';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import User from '../Models/user.model';
import { getParameterValue } from '../Config/awsParams.config';

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

const initializeDBConnection = async () => {
  const dbUrl = getParameterValue('DB_URL');

  if (!dbUrl) {
    throw new Error('Database Connection String is not defined');
  }

  mongoose.connect(await dbUrl)
    .then(() => console.log('Connected to MongoDB'))
    .catch(err => console.error('Could not connect to MongoDB:', err));
}
initializeDBConnection();
  
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

      const updateData = {
        accessToken: access_token,
        tokenType: token_type,
        scope: scope,
        botUserId: bot_user_id,
        appId: app_id,
        team: team ? { name: team.name, id: team.id } : undefined,
        enterprise: enterprise ? { name: enterprise.name, id: enterprise.id } : undefined,
        authedUser: authed_user ? {
          id: authed_user.id,
          scope: authed_user.scope,
          accessToken: authed_user.access_token,
          tokenType: authed_user.token_type
        } : undefined,
      };

      await User.findOneAndUpdate({ slackUserId: authed_user?.id }, updateData, { new: true, upsert: true });

      return response.redirect('/success');
    } else {
      console.error('Error obtaining access token:', tokenResponse.data.error);
      return response.status(500).send(`Error obtaining access token: ${tokenResponse.data.error}`);
    }
  } catch (error) {
    console.error('Error during token exchange:', error);
    return response.status(500).send('Internal Server Error');
  }
};
