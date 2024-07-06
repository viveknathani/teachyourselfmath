import { ApiResponse, HTTP_CODE, IMAGE_FORMAT } from '../types';
import express from 'express';
import { rateLimit } from 'express-rate-limit';
import RedisClient from 'ioredis';
import config from '../config';
import { RedisStore } from 'rate-limit-redis';
import { readFile } from 'fs/promises';
import memoizee from 'memoizee';
import axios from 'axios';
import OpenAI from 'openai';

const sendStandardResponse = (
  statusCode: HTTP_CODE,
  response: ApiResponse,
  res: express.Response,
) => {
  res.status(statusCode).send(response);
};

const snakeCaseToCamelCaseString = (input: string): string => {
  return input
    .split('_')
    .map((word, index) => {
      if (index !== 0) {
        return word.charAt(0).toUpperCase() + word.slice(1);
      }
      return word;
    })
    .join('');
};

const snakeCaseToCamelCaseObject = (input: any) => {
  if (input === undefined || input === null) {
    return input;
  }
  const out: any = {};
  Object.keys(input).forEach((key) => {
    out[snakeCaseToCamelCaseString(key)] = input[key];
  });
  return out;
};

const extractBearerToken = (authorizationHeader: string): string | null => {
  if (!authorizationHeader) {
    return null;
  }

  const parts = authorizationHeader.split(' ');
  if (parts.length !== 2 || parts[0].toLowerCase() !== 'bearer') {
    return null;
  }

  return parts[1];
};

const getSplits = (
  numberOfUnits: number,
  batchSize: number,
): {
  start: number;
  end: number;
}[] => {
  const result: { start: number; end: number }[] = [];
  for (let i = 1; i <= numberOfUnits; i += batchSize) {
    result.push({
      start: i,
      end: Math.min(i + batchSize - 1, numberOfUnits),
    });
  }
  return result;
};

const isNothing = (input: string): boolean => {
  if (input === null || input === undefined || input === '') {
    return true;
  }
  let isAllBlank = true;
  for (const char of input) {
    if (char !== ' ') {
      isAllBlank = false;
      break;
    }
  }
  return isAllBlank;
};

const hasAtleastOneNumber = (input: string) => {
  return /\d/.test(input);
};

const getPaginationConfig = (input: { page: number; limit?: number }) => {
  const limit = input.limit || 10;
  const offset = (input.page - 1) * limit;
  return {
    limit,
    offset,
  };
};

const TIME_IN_SECONDS = {
  ONE_HOUR: 60 * 60,
  ONE_DAY: 60 * 60 * 24,
};

const getRateLimiter = async () => {
  const redisClient = new RedisClient(config.REDIS_URL);
  return rateLimit({
    windowMs: 60 * 1000,
    max: 700,
    standardHeaders: 'draft-7',
    legacyHeaders: false,
    store: new RedisStore({
      // @ts-expect-error promise<unknown> and args type
      sendCommand: (...args: string[]) => redisClient.call(...args),
    }),
  });
};

const sanitisePrediction = (input: string): string => {
  let result = input;
  const ASTERISK_BASED_PREFIX = '*';
  if (input.startsWith(ASTERISK_BASED_PREFIX)) {
    result = input.slice(ASTERISK_BASED_PREFIX.length);
  }
  result = result
    .replace(/\*\d+[.)]\*\*/, '') // eg:- input is "**123.** problem", output is " problem"
    .replace(/^\d+[.)]/, '') // eg:- input is "123. problem", output is " problem"
    .trim(); // and now, output is just, "problem"
  return result;
};

const sendEmail = async (request: {
  from: string;
  to: string;
  subject: string;
  html: string;
}) => {
  return axios.post(
    'https://api.postmarkapp.com/email',
    {
      From: request.from,
      To: request.to,
      Subject: request.subject,
      HtmlBody: request.html,
    },
    {
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
        'X-Postmark-Server-Token': config.POSTMARK_API_KEY,
      },
    },
  );
};

const getRandomNumber = (min: number, max: number) => {
  return Math.floor(Math.random() * (max - min + 1)) + min;
};

const readFileMemoized = memoizee(readFile, {
  promise: true,
});

const magic = new OpenAI({
  apiKey: config.OPENAI_API_KEY,
});

const getBase64ImageUrlFromBuffer = (
  imageBuffer: Buffer,
  imageFormat: IMAGE_FORMAT,
) => {
  const base64Image = imageBuffer.toString('base64');
  return `data:image/${imageFormat};base64,${base64Image}`;
};

export {
  sendStandardResponse,
  snakeCaseToCamelCaseObject,
  extractBearerToken,
  isNothing,
  hasAtleastOneNumber,
  getSplits,
  getPaginationConfig,
  TIME_IN_SECONDS,
  getRateLimiter,
  sanitisePrediction,
  sendEmail,
  getRandomNumber,
  readFileMemoized,
  getBase64ImageUrlFromBuffer,
  magic,
};
