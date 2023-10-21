import { ApiResponse, HTTP_CODES } from '../types';
import express from 'express';

const sendStandardResponse = (
  statusCode: HTTP_CODES,
  response: ApiResponse,
  res: express.Response,
) => {
  res.status(statusCode).send(response);
};

export { sendStandardResponse };
