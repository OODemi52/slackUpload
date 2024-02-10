import express from 'express';
import axios from 'axios';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import User from '../Models/user.model';

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

const dbUrl = process.env.DB_URL;

if (!dbUrl) {
  throw new Error('DB_URL is not defined');
}

mongoose.connect(dbUrl)
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error('Could not connect to MongoDB:', err));

export const auth = async (request: express.Request, response: express.Response) => {
  response.status(400).send('Something went wrong, you should not be here!');
}

export const callback = async (request: express.Request, response: express.Response) => {
  const { code } = request.query;
  const clientId = process.env.SLACK_CLIENT_ID;
  const clientSecret = process.env.SLACK_CLIENT_SECRET;
  
  if (!code || !clientId || !clientSecret) {
    return response.status(400).send('Missing required information.');
  }
  
  try {
    const tokenResponse = await axios.post<SlackOAuthResponse>('https://slack.com/api/oauth.v2.access', null, {
      params: {
        client_id: clientId,
        client_secret: clientSecret,
        code,
      },
    });

    if (!tokenResponse.data.ok) {
      console.error('Error obtaining access token:', tokenResponse.data.error);
      return response.status(500).send(`Error obtaining access token: ${tokenResponse.data.error}`);
    }
    
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

  } catch (error) {
    console.error('Error during token exchange:', error);
    return response.status(500).send('Internal Server Error');
  }
};