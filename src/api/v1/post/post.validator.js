import joi from 'joi';

export const getCategoriesSchema = joi.object({
    name: joi.string(),
    limit: joi.number().min(0).max(1000).default(50),
    page: joi.number().min(1).default(1),
  });
  
  export const addCategorySchema = joi.object({
    name: joi.string().required(),
  });

  export const postsSchema = joi.object({
    category: joi.string(),
    title: joi.string(),
    limit: joi.number().min(0).max(1000).default(50),
    page: joi.number().min(1).default(1),
    startDate: joi.date(),
    endDate: joi.date(),
  });
  
  export const addPostSchema = joi.object({
    category: joi.string().required(),
    title: joi.string().required(),
    description: joi.string().required(),
  });
  
  export const updatePostSchema = joi.object({
    postId: joi.string().required(),
    title: joi.string(),
    description: joi.string(),
  });