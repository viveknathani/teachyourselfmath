import express from 'express';
import { problemRouter } from './problem';
import { commentRouter } from './comment';
import { userRouter } from './user';
import { voteRouter } from './vote';
import { fileProcessorRouter } from './file-processor';
import { pageRouter } from './page';
import { utilityRouter } from './utility';
import { tagRouter } from './tag';

const router: express.Router = express.Router();

router.use('/users', userRouter);
router.use('/problems/', problemRouter);
router.use('/comments/', commentRouter);
router.use('/votes/', voteRouter);
router.use('/file-processor', fileProcessorRouter);
router.use('/utility', utilityRouter);
router.use('/tags', tagRouter);

export { router, pageRouter };
