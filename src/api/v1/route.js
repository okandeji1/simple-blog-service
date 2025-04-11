import { Router } from 'express';
import { userRouter } from '../v1/user/user.route.js';
import { postRouter } from '../v1/post/post.route.js';

const routes = Router();

routes.use('/users', userRouter);
routes.use('/posts', postRouter);

export default routes;
