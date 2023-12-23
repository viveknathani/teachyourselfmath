import { addToSplitFileQueue } from '../queues/workers/splitFile';
import { QUEUE_NAME } from '../types';

export class FileProcessorService {
  private static instance: FileProcessorService;
  private constructor() {}

  public static getInstance(): FileProcessorService {
    if (!FileProcessorService.instance) {
      FileProcessorService.instance = new FileProcessorService();
    }
    return FileProcessorService.instance;
  }

  public async processFile(file: Express.Multer.File, tags: string) {
    const job = await addToSplitFileQueue({
      file,
      tags,
    });
    return {
      jobId: job.id,
      jobName: job.name,
      queueName: QUEUE_NAME.SPLIT_FILE,
    };
  }
}
