import * as express from 'express';
import * as path from 'path';
import { readFileMemoized } from '../utils';
import { ProblemService } from '../services/ProblemService';
import { CommentService } from '../services/CommentService';
import { state } from '../state';
import { injectOptionalUserInfoMiddleWare } from './user';

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

pageRouter.get('/', (req: express.Request, res: express.Response) => {
  // temporary redirect to problems page
  res.redirect('/problems');
});

pageRouter.get(
  '/problems',
  injectOptionalUserInfoMiddleWare,
  async (req: express.Request, res: express.Response) => {
    try {
      const problemService = ProblemService.getInstance(state);
      const user = req.body.user;

      // Get query parameters
      const page = parseInt(req.query.page as string) || 1;
      const difficulty = (req.query.difficulty as string) || 'ANY';
      const tags = req.query.tags ? (req.query.tags as string).split(',') : [];
      const bookmarked = req.query.bookmarked === 'true';

      // Get problems with filters and pagination
      const problemsResponse = await problemService.getProblems(
        user?.id || null,
        {
          difficulty: difficulty === 'ANY' ? undefined : difficulty,
          tags: tags.length > 0 ? tags.join(',') : undefined,
          bookmarked: bookmarked || undefined,
          page,
          limit: 10,
        },
      );

      // Render the EJS template with data
      res.render('problems', {
        problems: problemsResponse.problems,
        currentPage: page,
        totalPages: Math.ceil(problemsResponse.totalCount / 10),
      });
    } catch (err) {
      console.error('Error rendering problems page:', err);
      res.status(500).send('Internal Server Error');
    }
  },
);

pageRouter.get('/about', sendHTML('../web/pages/about.html'));
pageRouter.get('/auth', sendHTML('../web/pages/auth.html'));
pageRouter.get('/auth/reset', sendHTML('../web/pages/auth_reset.html'));
pageRouter.get('/produce', sendHTML('../web/pages/produce.html'));
pageRouter.get('/club', sendHTML('../web/pages/club.html'));

pageRouter.get('/problem', (req: express.Request, res: express.Response) => {
  const problemId = parseInt(req.query.id as string);
  if (!problemId) {
    res.status(400).send('problem id is required');
    return;
  }
  res.redirect(`/problem/${problemId}`);
});

pageRouter.get(
  '/problem/:id',
  injectOptionalUserInfoMiddleWare,
  async (req: express.Request, res: express.Response) => {
    try {
      const problemId = parseInt(req.params.id);
      if (!problemId) {
        res.status(400).send('Problem ID is required');
        return;
      }

      const problemService = ProblemService.getInstance(state);
      const commentService = CommentService.getInstance(state);

      // Get problem details
      const problem = await problemService.getProblem(problemId);
      if (!problem) {
        res.status(404).send('Problem not found');
        return;
      }

      // Get comments
      const comments = await commentService.getComments({
        problemId,
        parentId: null,
      });

      // Render the EJS template
      res.render('problem', {
        problem,
        comments,
        marked: require('marked'),
      });
    } catch (err) {
      console.error('Error rendering problem page:', err);
      res.status(500).send('Internal Server Error');
    }
  },
);

pageRouter.get('/tags', sendHTML('../web/pages/tags.html'));
pageRouter.get('/profile', sendHTML('../web/pages/profile.html'));
pageRouter.get('/digests', sendHTML('../web/pages/digest.html'));
pageRouter.get('/drafts', sendHTML('../web/pages/drafts.html'));
pageRouter.get('/search', sendHTML('../web/pages/search.html'));

export { pageRouter };
