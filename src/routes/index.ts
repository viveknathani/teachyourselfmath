import express from 'express';
import { problemRouter } from './problem';
import { userRouter } from './user';

const router: express.Router = express.Router();

router.use('/users', userRouter);
router.use('/problems/', problemRouter);

export { router };
