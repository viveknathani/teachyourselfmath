import { addToSplitFileQueue } from '../queues/workers/splitFile';
import { IMAGE_FORMAT, PROBLEM_DIFFICULTY, QUEUE_NAME } from '../types';
import { getBase64ImageUrlFromBuffer, magic } from '../utils';
import { readFile } from 'fs/promises';

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

  public async extractProblemsFromImageUrl(url: string) {
    const response = await magic.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        {
          role: 'user',
          content: [
            {
              type: 'text',
              text: 'I have an image from a math textbook. This image contains several elements including math problems, explanations, and answers. I need to extract only the math problems from this image and ignore any explanations and answers. Below is the image.',
            },
            {
              type: 'image_url',
              image_url: {
                url,
              },
            },
          ],
        },
      ],
      tools: [
        {
          type: 'function',
          function: {
            name: 'extract_math_problems',
            description:
              'Extract all math problems and convert them into the specified JSON format',
            parameters: {
              type: 'object',
              properties: {
                problems: {
                  type: 'array',
                  items: {
                    type: 'object',
                    properties: {
                      description: {
                        type: 'string',
                        description:
                          'The problem description, with mathematical figures in LaTeX',
                      },
                      difficulty: {
                        type: 'string',
                        enum: [
                          PROBLEM_DIFFICULTY.EASY,
                          PROBLEM_DIFFICULTY.MEDIUM,
                          PROBLEM_DIFFICULTY.HARD,
                        ],
                        description: 'The difficulty level of the problem',
                      },
                    },
                  },
                },
              },
            },
          },
        },
      ],
      tool_choice: 'required',
      temperature: 0,
    });
    return JSON.parse(
      response.choices?.[0]?.message.tool_calls?.[0]?.function.arguments ||
        '{}',
    );
  }

  public async extractProblemsFromImageBuffer(
    imageBuffer: Buffer,
    imageFormat: IMAGE_FORMAT,
  ) {
    const url = getBase64ImageUrlFromBuffer(imageBuffer, imageFormat);
    return this.extractProblemsFromImageUrl(url);
  }

  public async extractProblemsFromImageFile(
    imageFile: Express.Multer.File,
    imageFormat: IMAGE_FORMAT,
  ) {
    const imageBuffer = await readFile(imageFile.path);
    return this.extractProblemsFromImageBuffer(imageBuffer, imageFormat);
  }
}
