import mongoose from 'mongoose';
import mongoosePaginate from 'mongoose-paginate-v2';

const PostSchema = new mongoose.Schema({
    title: {
        type: String,
    },
    category: {
        type: String,
    },
    description: {
        type: String,
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
    updatedAt: {
        type: Date,
        default: Date.now,
    },
});

PostSchema.plugin(mongoosePaginate);

export const Post = mongoose.model("Post", PostSchema);