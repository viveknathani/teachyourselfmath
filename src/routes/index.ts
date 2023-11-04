import express from 'express';
import { problemRouter } from './problem';
import { commentRouter } from './comment';
import { userRouter } from './user';
import { voteRouter } from './vote';

const router: express.Router = express.Router();

router.use('/users', userRouter);
router.use('/problems/', problemRouter);
router.use('/comments/', commentRouter);
router.use('/votes/', voteRouter);

export { router };
