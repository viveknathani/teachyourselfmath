import winston from 'winston';
import expressWinston from 'express-winston';
import express from 'express';
import cors from 'cors';
import config from './config';
import { router, pageRouter } from './routes';
import * as path from 'path';
import { SERVER_ENVIRONMENT } from './types';
import { createBullDashboardAndAttachRouter } from './queues/dashboard';

async function main() {
  const requestLogger = expressWinston.logger({
    format: winston.format.json(),
    transports: [new winston.transports.Console()],
    meta: true,
    expressFormat: true,
  });
  const app = express();
  if (config.ENVIRONMENT !== SERVER_ENVIRONMENT.DEV) {
    app.set('trust proxy', true);
  }
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));
  app.use(requestLogger);
  createBullDashboardAndAttachRouter(app);
  app.set('view engine', 'ejs');
  app.set('views', path.join(__dirname, './web/views'));
  app.use(cors());
  app.use('/', pageRouter);
  app.use('/web', express.static(path.join(__dirname, './web')));
  app.use('/api/v1', router);
  app.get('/robots.txt', (req, res) => {
    res.type('text/plain');
    res.send('User-agent: *\nDisallow: /admin/');
  });
  app.listen(config.PORT, () => {
    console.log(
      `💨 server is running at: ${config.HOST}:${config.PORT}, environment is ${config.ENVIRONMENT}`,
    );
  });
}

main();
