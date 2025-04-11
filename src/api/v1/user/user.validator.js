import joi from 'joi';

export const setupTenantSchema = joi.object({
  name: joi.string().required(),
  company: joi.string().required(),
});

export const registerTenantSchema = joi.object({
  tenant: joi.string().required(),
});

export const registerUserSchema = joi.object({
  password: joi.string().required(),
  lastName: joi.string().required(),
  firstName: joi.string().required(),
  email: joi.string().email().required(),
  phone: joi.string(),
});

export const loginUserSchema = joi.object({
  email: joi.string().email().required(),
  password: joi.string().min(6).required(),
});

export const getUserSchema = joi.object({
  email: joi.string(),
  status: joi.string(),
  limit: joi.number().min(0).max(1000).default(50),
  page: joi.number().min(1).default(1),
});
