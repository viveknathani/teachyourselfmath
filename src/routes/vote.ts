import express from 'express';
import { VoteService } from '../services/VoteService';
import { state } from '../state';
import { HTTP_CODE } from '../types';
import { sendStandardResponse } from '../utils';
import { injectUserInfoMiddleWare } from './user';

const voteRouter: express.Router = express.Router();
const voteService = VoteService.getInstance(state);

voteRouter.use(injectUserInfoMiddleWare);

voteRouter.post('/', async (req, res) => {
  try {
    const insertedVote = await voteService.insertVote({
      ...req.body,
      userId: req.body.user.id,
    });
    sendStandardResponse(
      HTTP_CODE.CREATED,
      {
        status: 'success',
        data: insertedVote,
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

export { voteRouter };
