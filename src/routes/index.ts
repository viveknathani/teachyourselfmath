import express from 'express';
import { HTTP_CODES } from '../types';
import { sendStandardResponse } from '../utils';

const router: express.Router = express.Router();

router.get('/test', async (req, res) => {
  sendStandardResponse(
    HTTP_CODES.OK,
    {
      status: 'success',
      data: {
        message: 'from server!',
      },
    },
    res,
  );
});

export { router };
