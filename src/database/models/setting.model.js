import mongoose from 'mongoose';
import mongoosePaginate from 'mongoose-paginate-v2';

const SettingSchema = new mongoose.Schema({
    userCount: {
        type: Number,
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

SettingSchema.plugin(mongoosePaginate);
export const Setting = mongoose.model("Setting", SettingSchema);