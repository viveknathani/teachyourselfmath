import express from 'express';
import { UploadedFile } from 'express-fileupload';
import { FileProcessorService } from '../services/FileProcessorService';
import { HTTP_CODE } from '../types';
import { sendStandardResponse } from '../utils';
import { checkFailsForApiKey } from './apiKey';

const fileProcessorRouter: express.Router = express.Router();
const fileProcessorService = FileProcessorService.getInstance();

fileProcessorRouter.post('/send-file', async (req, res) => {
  try {
    if (checkFailsForApiKey(req, res)) {
      return;
    }
    const file = req.files?.tym as UploadedFile;
    const response = await fileProcessorService.processFile(file);
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

export { fileProcessorRouter };
