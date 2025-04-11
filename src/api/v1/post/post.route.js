import express from 'express';
import * as postController from './post.controller.js';
import { inputValidator, resolveConnection, isAuthenticated } from '../../../util/middleware.js';
import { addCategorySchema, addPostSchema, getCategoriesSchema, postsSchema, updatePostSchema } from './post.validator.js';

export const postRouter = express.Router();

postRouter.get(
    '/categories',
    inputValidator({ query: getCategoriesSchema }),
    resolveConnection,
    isAuthenticated,
    postController.getCategories,
);

postRouter.post(
    '/add/category',
    inputValidator({ body: addCategorySchema }),
    resolveConnection,
    isAuthenticated,
    postController.addCategory,
);

postRouter.get(
    '/',
    inputValidator({ query: postsSchema }),
    resolveConnection,
    isAuthenticated,
    postController.posts,
);

postRouter.post(
    '/add',
    inputValidator({ body: addPostSchema }),
    resolveConnection,
    isAuthenticated,
    postController.addPost,
);

postRouter.put(
    '/update',
    inputValidator({ body: updatePostSchema }),
    resolveConnection,
    isAuthenticated,
    postController.updatePost,
);