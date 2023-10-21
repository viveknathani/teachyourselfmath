import { ApiResponse, HTTP_CODE } from '../types';
import express from 'express';

const sendStandardResponse = (
  statusCode: HTTP_CODE,
  response: ApiResponse,
  res: express.Response,
) => {
  res.status(statusCode).send(response);
};

export { sendStandardResponse };
