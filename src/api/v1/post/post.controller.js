import { AppError, catchAsyncError } from '../../../util/appError.js';
import { Category } from '../../../database/models/category.model.js';
import { Post } from '../../../database/models/post.model.js';

export const addCategory = catchAsyncError(async (req, res) => {
    const obj = req.body;

    const category = await Category.findOne({ name: obj.name });

    if (category) {
        throw new AppError('category already exist', 400);
    }

    const newCategory = await Category.create(obj);

    return res.status(201).json({
        status: true,
        message: 'new category created successfully',
        data: newCategory,
    });
});

export const getCategories = catchAsyncError(async (req, res) => {
    const obj = req.query;

    const { limit, page } = req.query;

    let query = {};
    for (const [key, value] of Object.entries(obj)) {
        if (key === 'tenant' || key === 'limit' || key === 'page') {
            continue;
        }
        query = { ...query, [key]: value };
    }

    const options = {
        page,
        limit,
        sort: { createdAt: 'desc' },
        collation: {
            locale: 'en',
        },
        lean: true,
    };

    const categories = await Category.paginate(query, options);

    return res.status(200).json({
        status: true,
        message: 'found category(s)',
        data: categories.docs,
        meta: {
            total: categories.totalDocs,
            skipped: categories.page * categories.limit,
            perPage: categories.limit,
            page: categories.page,
            pageCount: categories.totalPages,
            hasNextPage: categories.hasNextPage,
            hasPrevPage: categories.hasPrevPage,
        },
    });
});

export const posts = catchAsyncError(async (req, res) => {
    const obj = req.query;

    const { limit, page } = req.query;

    let query = {};
    for (const [key, value] of Object.entries(obj)) {
        if (key === 'tenant' || key === 'limit' || key === 'page') {
            continue;
        }
        query = { ...query, [key]: value };
    }

    const options = {
        page,
        limit,
        sort: { createdAt: 'desc' },
        collation: {
            locale: 'en',
        },
        lean: true,
    };

    const posts = await Post.paginate(query, options);

    return res.status(200).json({
        status: true,
        message: 'found post(s)',
        data: posts.docs,
        meta: {
            total: posts.totalDocs,
            skipped: posts.page * posts.limit,
            perPage: posts.limit,
            page: posts.page,
            pageCount: posts.totalPages,
            hasNextPage: posts.hasNextPage,
            hasPrevPage: posts.hasPrevPage,
        },
    });
});

export const addPost = catchAsyncError(async (req, res) => {
    const obj = req.body;

    const category = await Category.findOne({ name: obj.category });

    if (!category) {
        throw new AppError('category not found', 404);
    }

    const post = await Post.findOne({ title: obj.title, category: obj.category });

    if (post) {
        throw new AppError('Post already exists', 400);
    }

    const newPost = await Post.create(obj);

    return res.status(201).json({
        status: true,
        message: 'new post created successfully',
        data: newPost,
    });
});

export const updatePost = catchAsyncError(async (req, res) => {
    const obj = req.body;
    const opts = { new: true };

    const updatedPost = await Post.findOneAndUpdate(
        { _id: obj.postId },
        obj,
        opts,
    );

    if (!updatedPost) {
        throw new AppError('Post does not exist', 400);
    }

    return res.status(200).json({
        status: true,
        message: 'Post updated successfully',
        data: updatedPost,
    });
});