import mongoose from 'mongoose';

const TenantSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        unique: true,
    },
    company: {
        type: String,
    },
    apiKey: {
        live: {
            type: String,
            required: true,
            unique: true,
        },
        test: {
            type: String,
            required: true,
            unique: true,
        },
    },
    status: {
        type: String,
        default: 'ACTIVE'
    },
    security: {
        whitelist: [
            {
                type: String,
                default: ['::1', '0.0.0.0'],
            }
        ],
        blacklist: [
            {
                type: String,
                default: [],
            }
        ]
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

export const Tenant = mongoose.model("Tenant", TenantSchema);