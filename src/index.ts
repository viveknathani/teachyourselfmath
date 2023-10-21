import winston from 'winston';
import expressWinston from 'express-winston';
import express from 'express';
import cors from 'cors';
import config from './config';
import { router } from './routes';

async function main() {
  const requestLogger = expressWinston.logger({
    format: winston.format.json(),
    transports: [new winston.transports.Console()],
    meta: true,
    expressFormat: true,
  });
  const app = express();
  app.use(express.json());
  app.use(requestLogger);
  app.use(cors());
  app.use('/api/v1', router);
  app.listen(config.PORT, () => {
    console.log(`💨 server is running at: ${config.HOST}:${config.PORT}`);
  });
}

main();
