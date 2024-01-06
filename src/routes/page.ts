import * as express from 'express';
import * as path from 'path';

const pageRouter: express.Router = express.Router();

type ExpressFunction = (
  req: express.Request,
  res: express.Response,
) => Promise<void>;

function directoryHandler(webPagePath: string): ExpressFunction {
  return async (req: express.Request, res: express.Response) => {
    try {
      res.sendFile(path.resolve(__dirname, webPagePath));
    } catch (err) {
      console.log(err);
      res.status(500).json({ message: '' });
    }
  };
}

pageRouter.get('/', directoryHandler('../web/pages/home.html'));
pageRouter.get('/about', directoryHandler('../web/pages/about.html'));
pageRouter.get('/auth', directoryHandler('../web/pages/auth.html'));
pageRouter.get('/problem', directoryHandler('../web/pages/problem.html'));

export { pageRouter };
