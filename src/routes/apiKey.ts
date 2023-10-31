import * as express from 'express';
import config from '../config';
import { HTTP_CODE } from '../types';
import { sendStandardResponse } from '../utils';

export const checkFailsForApiKey = (
  req: express.Request,
  res: express.Response,
) => {
  const apiKey = req.headers['x-tym-api-key'];
  if (apiKey !== config.TYM_API_KEY) {
    sendStandardResponse(
      HTTP_CODE.UNAUTHORIZED,
      {
        status: 'error',
        message: 'you need the correct X-TYM-API-KEY to proceed.',
      },
      res,
    );
    return true;
  }
  return false;
};
