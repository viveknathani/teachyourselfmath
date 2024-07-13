import express from 'express';
import { DataValidationError } from '../services/errors';
import { HTTP_CODE } from '../types';
import { sendStandardResponse } from '../utils';
import { UserConfigurationService } from '../services/UserConfigurationService';
import { state } from '../state';
import { injectUserInfoMiddleWare } from './user';

const configurationRouter: express.Router = express.Router();
const userConfigurationService = UserConfigurationService.getInstance(state);

configurationRouter.post('/', injectUserInfoMiddleWare, async (req, res) => {
  try {
    const result = await userConfigurationService.createConfiguration(
      req.body.user.id,
      req.body,
    );

    sendStandardResponse(
      HTTP_CODE.CREATED,
      {
        status: 'success',
        data: result,
      },
      res,
    );
  } catch (err) {
    if (err instanceof DataValidationError) {
      sendStandardResponse(
        HTTP_CODE.CLIENT_ERROR,
        {
          status: 'error',
          message: err.message,
          data: err.details,
        },
        res,
      );
      return;
    }

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

configurationRouter.delete(
  '/:id',
  injectUserInfoMiddleWare,
  async (req, res) => {
    try {
      const result = await userConfigurationService.deleteConfiguration(
        req.body.user.id,
        Number(req.params.id),
      );

      sendStandardResponse(
        HTTP_CODE.OK,
        {
          status: 'success',
          data: result,
        },
        res,
      );
    } catch (err) {
      if (err instanceof DataValidationError) {
        sendStandardResponse(
          HTTP_CODE.CLIENT_ERROR,
          {
            status: 'error',
            message: err.message,
            data: err.details,
          },
          res,
        );
        return;
      }

      console.log(err);
      sendStandardResponse(
        HTTP_CODE.SERVER_ERROR,
        {
          status: 'error',
        },
        res,
      );
    }
  },
);

export { configurationRouter };
