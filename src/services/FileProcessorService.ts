import { SchemaType } from '@google/generative-ai';
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
    const model = magic.getGenerativeModel({
      model: 'gemini-1.5-pro',
      tools: [
        {
          functionDeclarations: [
            {
              name: 'extract_math_problems',
              description:
                'Extract all math problems and convert them into the specified JSON format',
              parameters: {
                type: SchemaType.OBJECT,
                properties: {
                  problems: {
                    type: SchemaType.ARRAY,
                    items: {
                      type: SchemaType.OBJECT,
                      properties: {
                        description: {
                          type: SchemaType.STRING,
                          description:
                            'The problem description, with mathematical figures in LaTeX',
                        },
                        difficulty: {
                          type: SchemaType.STRING,
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
          ],
        },
      ],
    });
    const [formatPart, imagePart] = url.split(',');
    const response = await model.generateContent({
      contents: [
        {
          role: 'user',
          parts: [
            {
              text: 'I have an image from a math textbook. This image contains several elements including math problems, explanations, and answers. I need to extract only the math problems from this image and ignore any explanations and answers. Below is the image.',
            },
            {
              inlineData: {
                data: imagePart,
                // `formatPart`` will be `data:image/${imageFormat};base64`
                // and we just need `image/${imageFormat}`
                mimeType: formatPart.split(';')[0].split(':')[1], // formatPart will be
              },
            },
          ],
        },
      ],
    });
    return response.response.candidates?.[0]?.content?.parts?.[0]?.functionCall
      ?.args;
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
