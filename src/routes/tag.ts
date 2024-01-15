import * as express from 'express';
import { TagService } from '../services/TagService';
import { state } from '../state';
import { HTTP_CODE } from '../types';
import { sendStandardResponse } from '../utils';

const tagRouter: express.Router = express.Router();
const tagService = TagService.getInstance(state);

tagRouter.get('/', async (req, res) => {
  try {
    const response = await tagService.getTags();
    sendStandardResponse(
      HTTP_CODE.OK,
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

export { tagRouter };
