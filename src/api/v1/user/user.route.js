import express from 'express';
import * as userController from './user.controller.js';
import { inputValidator, resolveConnection, isAuthenticated } from '../../../util/middleware.js';
import {
  getUserSchema,
  loginUserSchema,
  registerTenantSchema,
  registerUserSchema,
  setupTenantSchema,
} from './user.validator.js';
export const userRouter = express.Router();

userRouter.post(
  '/tenant/setup',
  inputValidator({ body: setupTenantSchema }),
  userController.tenantSetUp,
);

userRouter.post(
  '/tenant/register',
  inputValidator({ body: registerTenantSchema }),
  resolveConnection,
  userController.registerTenant,
);

userRouter.post(
  '/register',
  inputValidator({ body: registerUserSchema }),
  resolveConnection,
  userController.registerUser,
);

userRouter.post(
  '/login',
  inputValidator({ body: loginUserSchema }),
  resolveConnection,
  userController.loginUser,
);

userRouter.get(
  '/',
  inputValidator({ query: getUserSchema }),
  resolveConnection,
  isAuthenticated,
  userController.getUsers,
);

userRouter.get('/me', resolveConnection, isAuthenticated, userController.getUser);
