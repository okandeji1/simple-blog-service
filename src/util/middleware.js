import { AppError } from "./appError.js";
import {
    buildResponse,
    includesSome,
    paginationSchema,
    verifyToken,
} from "./utility.js";
import { Tenant } from '../database/models/tenant.model.js';

export const inputValidator = (schema) => {
    return (req, res, next) => {
        if (schema.paginationQuery) {
            schema.query = schema.query.keys(paginationSchema().query);
            delete schema.paginationQuery;
        }

        for (const [key, item] of Object.entries(schema)) {
            const { error, value } = item.validate(req[key], { abortEarly: false });

            if (error) {
                return res.status(400).json({
                    status: false,
                    message: error.message,
                    data: "invalid payload",
                });
            }

            if (key === 'query' && typeof req.query === 'object') {
                Object.assign(req.query, value);
            } else {
                req[key] = value;
            }
        }

        next();
    };
};

/**
 * Get the connection instance for the given tenant's slug and set it to the current context.
 * */
export const resolveConnection = async (req, res, next) => {
    const apiKey = req.query["x-api-key"]
        ? req.query["x-api-key"]
        : req.headers?.["x-api-key"];

    if (!apiKey) {
        return buildResponse(res, 401, {
            status: false,
            message: "please provide api key",
        });
    }

    let query = {};

    if (apiKey.includes("test")) {
        query = { "apiKey.test": apiKey };
    } else {
        query = { "apiKey.live": apiKey };
    }

    const tenant = await Tenant.findOne(query).lean();
    if (!tenant) {
        return buildResponse(res, 401, {
            status: false,
            message: "unauthorized API key, your API key is not recognized",
        });
    }

    if (
        !apiKey.includes("test") &&
        (includesSome(tenant.security.blacklist, [req.ip]) ||
            (!includesSome(tenant.security.whitelist, ["0.0.0.0"]) &&
                !includesSome(tenant.security.whitelist, [req.ip])))
    ) {
        return buildResponse(res, 401, {
            status: false,
            message: "unauthorized host, your host ip is not permitted",
        });
    }

    next();
};

export const isAuthenticated = (req, res, next) => {
    let accessToken = req.headers?.authorization || req.query.accessToken;
    if (!accessToken) {
        throw new AppError("access token not found", 401);
    }
    try {
        // stripe auth kind (e.g bearer) from the accesstoken
        const auth = accessToken.split(" ");
        // eslint-disable-next-line prefer-destructuring
        accessToken = auth[1];

        req.user = verifyToken(accessToken);

        next();
    } catch (error) {
        if (
            error.name?.includes("JsonWebTokenError") ||
            error.name?.includes("TokenExpiredError")
        ) {
            throw new AppError(error.message, 401);
        }
        throw new AppError("invalid access token", 401);
    }
};