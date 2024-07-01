import * as express from 'express';
import * as path from 'path';
import { readFileMemoized } from '../utils';

const pageRouter: express.Router = express.Router();

type ExpressFunction = (
  req: express.Request,
  res: express.Response,
) => Promise<void>;

function sendHTML(webPagePath: string): ExpressFunction {
  return async (req: express.Request, res: express.Response) => {
    try {
      const text = await readFileMemoized(
        path.join(__dirname, webPagePath),
        'utf-8',
      );
      res.setHeader('Content-Type', 'text/html');
      res.send(text);
    } catch (err) {
      console.log(err);
      res.status(500).json({ message: '' });
    }
  };
}

pageRouter.get('/', sendHTML('../web/pages/home.html'));
pageRouter.get('/about', sendHTML('../web/pages/about.html'));
pageRouter.get('/auth', sendHTML('../web/pages/auth.html'));
pageRouter.get('/auth/reset', sendHTML('../web/pages/auth_reset.html'));
pageRouter.get('/problem', sendHTML('../web/pages/problem.html'));
pageRouter.get('/tags', sendHTML('../web/pages/tags.html'));
pageRouter.get('/profile', sendHTML('../web/pages/profile.html'));
pageRouter.get('/roadmap', (req, res) => {
  res.redirect(
    'https://viveknathani.notion.site/teachyourselfmath-public-roadmap-4eccf89a7308456fae201ce14c6c187b',
  );
});

export { pageRouter };
