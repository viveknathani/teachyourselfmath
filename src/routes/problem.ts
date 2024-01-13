import * as express from 'express';
import { ProblemService } from '../services/ProblemService';
import { state } from '../state';
import { HTTP_CODE } from '../types';
import { sendStandardResponse } from '../utils';
import { checkFailsForApiKey } from './apiKey';

const problemRouter: express.Router = express.Router();
const problemService = ProblemService.getInstance(state);

problemRouter.post('/', async (req, res) => {
  try {
    if (checkFailsForApiKey(req, res)) {
      return;
    }
    const response = await problemService.insertProblems(req.body);
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

problemRouter.get('/', async (req, res) => {
  try {
    const response = await problemService.getProblems(req.query);
    sendStandardResponse(
      HTTP_CODE.CREATED,
      {
        status: 'success',
        data: response,
      },
      res,
    );
  } catch (err) {
    sendStandardResponse(
      HTTP_CODE.SERVER_ERROR,
      {
        status: 'error',
      },
      res,
    );
  }
});

problemRouter.get('/:problemId', async (req, res) => {
  try {
    const response = await problemService.getProblem(
      req.params.problemId as any,
    );
    sendStandardResponse(
      HTTP_CODE.CREATED,
      {
        status: 'success',
        data: response,
      },
      res,
    );
  } catch (err) {
    sendStandardResponse(
      HTTP_CODE.SERVER_ERROR,
      {
        status: 'error',
      },
      res,
    );
  }
});

export { problemRouter };
