import mongoose from 'mongoose';
import mongoosePaginate from 'mongoose-paginate-v2';

const CategorySchema = new mongoose.Schema({
    name: {
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

CategorySchema.plugin(mongoosePaginate);

export const Category = mongoose.model("Category", CategorySchema);