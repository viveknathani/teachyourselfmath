import * as express from 'express';
import { UtilityService } from '../services/UtilityService';
import { state } from '../state';
import { HTTP_CODE } from '../types';
import { sendStandardResponse } from '../utils';
import { checkFailsForApiKey } from './apiKey';

const utilityRouter: express.Router = express.Router();
const utilityService = UtilityService.getInstance(state);

utilityRouter.delete('/cache', async (req, res) => {
  try {
    if (checkFailsForApiKey(req, res)) {
      return;
    }
    const response = await utilityService.clearCache(req.body.prefix);
    sendStandardResponse(
      HTTP_CODE.CREATED,
      {
        status: 'success',
        data: response,
      },
      res,
    );
  } catch (err) {
    console.log(err);
    sendStandardResponse(
      HTTP_CODE.SERVER_ERROR,
      {
        status: 'error',
      },
      res,
    );
  }
});

export { utilityRouter };
