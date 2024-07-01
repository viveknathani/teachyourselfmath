import express from 'express';
import { HealthCheckService } from '../services/HealthCheckService';
import { state } from '../state';
import { HTTP_CODE } from '../types';
import { sendStandardResponse } from '../utils';

const healthCheckRouter: express.Router = express.Router();
const healthCheckService = HealthCheckService.getInstance(state);

healthCheckRouter.get('/health', async (req, res) => {
  try {
    const healthCheckResponse = await healthCheckService.doHealthCheck();
    const { allGood } = healthCheckResponse;
    sendStandardResponse(
      allGood ? HTTP_CODE.OK : HTTP_CODE.SERVER_ERROR,
      {
        status: allGood ? 'success' : 'error',
        data: healthCheckResponse,
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

export { healthCheckRouter };
