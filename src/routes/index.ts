import express from 'express';
import { userRouter } from './user';

const router: express.Router = express.Router();

router.use('/users', userRouter);

export { router };
