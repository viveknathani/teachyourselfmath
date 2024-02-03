import { Job, JobsOptions } from 'bullmq';
import { QUEUE_NAME, RemoveJunkJobData } from '../../types';
import {
  hasAtleastOneNumber,
  isNothing,
  sanitisePrediction,
} from '../../utils';
import { createQueue, createWorker } from '../factory';
import { addToDatabaseQueue } from './addToDatabase';

const queueName = QUEUE_NAME.REMOVE_JUNK;

const queue = createQueue(queueName);

const worker = createWorker(queueName, async (job: Job) => {
  const data = job.data as RemoveJunkJobData;
  const checkForNonEmptyInput = !isNothing(data.prediction);
  const checkForRightSetOfWords = hasTheRightSetOfWords(data.prediction);
  const checkForAtleastOneNumber = hasAtleastOneNumber(data.prediction);
  if (
    checkForNonEmptyInput &&
    checkForRightSetOfWords &&
    checkForAtleastOneNumber
  ) {
    await addToDatabaseQueue({
      sanitisedPrediction: sanitisePrediction(data.prediction),
      source: data.source.replace('.pdf', ''),
      tags: data.tags.split(','),
    });
  }
  return {
    checkForNonEmptyInput,
    checkForRightSetOfWords,
    checkForAtleastOneNumber,
  };
});

const addToRemoveJunkQueue = (
  data: RemoveJunkJobData,
  options?: JobsOptions | undefined,
) => {
  const jobName = `${queueName}`;
  return queue.add(jobName, data, options);
};

const hasTheRightSetOfWords = (input: string) => {
  const phrases = [
    'find',
    'evaluate',
    'simplify',
    'express',
    'calculate',
    'show that',
    'prove that',
    'what is the probability',
    'find the probability',
  ];
  for (const phrase of phrases) {
    if (input.toLowerCase().includes(phrase)) {
      return true;
    }
  }
  return false;
};

export { queue, worker, addToRemoveJunkQueue };
