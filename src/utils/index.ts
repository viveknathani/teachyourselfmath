import { ApiResponse, HTTP_CODE } from '../types';
import express from 'express';

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
  return !/\d/.test(input);
};

export {
  sendStandardResponse,
  snakeCaseToCamelCaseObject,
  extractBearerToken,
  isNothing,
  hasAtleastOneNumber,
  getSplits,
};
