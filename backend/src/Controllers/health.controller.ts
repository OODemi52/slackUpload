
import express from 'express';

export const health = async (request: express.Request, response: express.Response) => {
  response.status(200).send('All good here!');
}
