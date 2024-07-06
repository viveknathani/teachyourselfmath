import express from 'express';
import { FileProcessorService } from '../services/FileProcessorService';
import { HTTP_CODE, IMAGE_FORMAT } from '../types';
import { sendStandardResponse } from '../utils';
import { checkFailsForApiKey } from './apiKey';
import multer from 'multer';
import config from '../config';

const fileProcessorRouter: express.Router = express.Router();
const fileProcessorService = FileProcessorService.getInstance();
const upload = multer({
  dest: 'files/',
  limits: {
    fileSize: config.MAX_FILE_SIZE_IN_BYTES,
  },
});

fileProcessorRouter.post(
  '/send-file',
  upload.single('tym'),
  async (req, res) => {
    try {
      if (checkFailsForApiKey(req, res)) {
        return;
      }
      if (req.file === undefined) {
        throw new Error('something is broken!');
      }
      const response = await fileProcessorService.processFile(
        req.file,
        req.body.tags,
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
  },
);

fileProcessorRouter.post(
  '/upload-image',
  upload.single('image'),
  async (req, res) => {
    try {
      if (checkFailsForApiKey(req, res)) {
        return;
      }
      if (req.file === undefined) {
        throw new Error('something is broken!');
      }
      const response = await fileProcessorService.extractProblemsFromImageFile(
        req.file,
        IMAGE_FORMAT.PNG,
      );
      sendStandardResponse(
        HTTP_CODE.OK,
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
  },
);

export { fileProcessorRouter };
