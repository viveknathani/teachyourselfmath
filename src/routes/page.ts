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
pageRouter.get('/problems', sendHTML('../web/pages/problems.html'));
pageRouter.get('/about', sendHTML('../web/pages/about.html'));
pageRouter.get('/auth', sendHTML('../web/pages/auth.html'));
pageRouter.get('/auth/reset', sendHTML('../web/pages/auth_reset.html'));
pageRouter.get('/produce', sendHTML('../web/pages/produce.html'));
pageRouter.get('/club', sendHTML('../web/pages/club.html'));
pageRouter.get('/problem', sendHTML('../web/pages/problem.html'));
pageRouter.get('/tags', sendHTML('../web/pages/tags.html'));
pageRouter.get('/profile', sendHTML('../web/pages/profile.html'));
pageRouter.get('/digests', sendHTML('../web/pages/digest.html'));
pageRouter.get('/drafts', sendHTML('../web/pages/drafts.html'));
pageRouter.get('/search', sendHTML('../web/pages/search.html'));
pageRouter.get('/issues/:issueNumber', async (req, res) => {
  try {
    const issueNumber = req.params.issueNumber;
    if (!/^\d+$/.test(issueNumber)) {
      res.status(400).send('Bad issue number');
      return;
    }
    const filePath = `../web/pdfs/ISSUE_${issueNumber}.pdf`;
    const downloadFilename = path.basename(filePath);
    res.setHeader(
      'Content-Disposition',
      `inline; filename="${downloadFilename}"`,
    );
    res.setHeader(
      'Content-Type',
      `application/${downloadFilename.split('.').pop()}`,
    );
    res.sendFile(path.resolve(__dirname, filePath));
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: '' });
  }
});

export { pageRouter };
