import winston from 'winston';
import expressWinston from 'express-winston';
import express from 'express';
import cors from 'cors';
import config from './config';
import { router, pageRouter } from './routes';
import * as path from 'path';
import helmet from 'helmet';
import { createDashboardAndGetRouter } from './queues/dashboard';
import { SERVER_ENVIRONMENT } from './types';
import { getRateLimiter } from './utils';

async function main() {
  const requestLogger = expressWinston.logger({
    format: winston.format.json(),
    transports: [new winston.transports.Console()],
    meta: true,
    expressFormat: true,
  });
  const app = express();
  if (config.ENVIRONMENT === SERVER_ENVIRONMENT.PROD) {
    app.use(helmet());
    app.set('trust proxy', 1);
  }
  const rateLimiter = await getRateLimiter();
  app.use(rateLimiter);
  app.use(express.json());
  app.use(requestLogger);
  app.use('/admin/queues', createDashboardAndGetRouter());
  app.use(cors());
  app.use('/', pageRouter);
  app.use('/web', express.static(path.join(__dirname, './web')));
  app.use('/api/v1', router);
  app.listen(config.PORT, () => {
    console.log(
      `💨 server is running at: ${config.HOST}:${config.PORT}, environment is ${config.ENVIRONMENT}`,
    );
  });
}

main();
