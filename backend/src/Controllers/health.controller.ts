// This endpoint is responsible for returning a 200 status code to indicate a healthy server for target groups when setting up an AWS Elastic Load Balancer.
import express from 'express';

export const health = async (request: express.Request, response: express.Response) => {
  response.status(200).send('All good here!');
}
