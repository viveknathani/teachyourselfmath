import express from 'express';
import { CommentService } from '../services/CommentService';
import { state } from '../state';
import { HTTP_CODE } from '../types';
import { sendStandardResponse } from '../utils';
import { injectUserInfoMiddleWare } from './user';

const commentRouter: express.Router = express.Router();
const commentService = CommentService.getInstance(state);

commentRouter.get('/problem/:problemId', async (req, res) => {
  try {
    const comments = await commentService.getComments({
      problemId: Number(req.params.problemId),
      parentId: null,
    });
    sendStandardResponse(
      HTTP_CODE.OK,
      {
        status: 'success',
        data: comments,
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

commentRouter.get('/problem/:problemId/parent/:parentId', async (req, res) => {
  try {
    const comments = await commentService.getComments({
      problemId: Number(req.params.problemId),
      parentId: Number(req.params.parentId),
    });
    sendStandardResponse(
      HTTP_CODE.OK,
      {
        status: 'success',
        data: comments,
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

commentRouter.use(injectUserInfoMiddleWare);

commentRouter.post('/', async (req, res) => {
  try {
    const insertedComment = await commentService.insertComment({
      ...req.body,
      userId: req.body.user.id,
    });
    sendStandardResponse(
      HTTP_CODE.CREATED,
      {
        status: 'success',
        data: insertedComment,
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

export { commentRouter };
