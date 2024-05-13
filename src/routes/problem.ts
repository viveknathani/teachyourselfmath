import * as express from 'express';
import { ProblemService } from '../services/ProblemService';
import { state } from '../state';
import { HTTP_CODE } from '../types';
import { sendStandardResponse } from '../utils';
import { checkFailsForApiKey } from './apiKey';
import { injectOptionalUserInfoMiddleWare } from './user';
import { ErrUserNotFound, ErrorCodesOfSQL } from '../services/errors';

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
    if (err)
      sendStandardResponse(
        HTTP_CODE.SERVER_ERROR,
        {
          status: 'error',
        },
        res,
      );
  }
});

problemRouter.use(injectOptionalUserInfoMiddleWare);
problemRouter.get('/', async (req, res) => {
  try {
    const response = await problemService.getProblems(
      req.body.user?.id || null,
      req.query,
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
    console.log(err);
    if (err instanceof ErrUserNotFound) {
      sendStandardResponse(
        HTTP_CODE.UNAUTHORIZED,
        {
          status: 'error',
          message: 'you need to login',
        },
        res,
      );
      return;
    }
    sendStandardResponse(
      HTTP_CODE.SERVER_ERROR,
      {
        status: 'error',
      },
      res,
    );
  }
});

problemRouter.post('/:problemId/bookmark', async (req, res) => {
  try {
    if (!req.body.user?.id) {
      sendStandardResponse(
        HTTP_CODE.UNAUTHORIZED,
        {
          status: 'error',
          message: 'you need to login',
        },
        res,
      );
      return;
    }
    const response = await problemService.bookmarkProblem(
      req.body.user?.id,
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
    console.log(err);
    if ((err as any)?.code === ErrorCodesOfSQL.UNIQUE_CONSTRAINT_VIOLATION) {
      sendStandardResponse(
        HTTP_CODE.CLIENT_ERROR,
        {
          status: 'error',
          message:
            'unique constraint violation, the operation you are trying to do has already happened.',
        },
        res,
      );
      return;
    }
    sendStandardResponse(
      HTTP_CODE.SERVER_ERROR,
      {
        status: 'error',
      },
      res,
    );
  }
});

problemRouter.delete('/:problemId/bookmark', async (req, res) => {
  try {
    if (!req.body.user?.id) {
      sendStandardResponse(
        HTTP_CODE.UNAUTHORIZED,
        {
          status: 'error',
          message: 'you need to login',
        },
        res,
      );
      return;
    }
    const response = await problemService.unbookmarkProblem(
      req.body.user?.id,
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

problemRouter.get('/:problemId/is-bookmarked', async (req, res) => {
  try {
    if (!req.body.user?.id) {
      sendStandardResponse(
        HTTP_CODE.UNAUTHORIZED,
        {
          status: 'error',
          message: 'you need to login',
        },
        res,
      );
      return;
    }
    const response = await problemService.isProblemBookmarkedByUser(
      req.body.user?.id,
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

export { problemRouter };
