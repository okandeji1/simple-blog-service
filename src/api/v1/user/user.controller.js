import bcrypt from "bcryptjs";
import { generateId } from "../../../@core/universal.js";
import { AppError, catchAsyncError } from "../../../util/appError.js";
import { generateTokens } from "../../../util/utility.js";
import { Setting } from '../../../database/models/setting.model.js';
import { Tenant } from '../../../database/models/tenant.model.js';
import { User } from '../../../database/models/user.model.js';

const config = process.env;
const { CONNECTION_NAME } = config;

export const tenantSetUp = catchAsyncError(
  async (req, res) => {
    const obj = req.body;

    // Check if tenant exists
    const query = { name: CONNECTION_NAME };

    const tenant = await Tenant.findOne(query);

    if (tenant) {
      throw new AppError("tenant already setup", 203);
    }

    // generate apiKey for B2B tenant
    const test = generateId({ suffix: "sk-test" });
    const live = generateId({ suffix: "sk" });

    const whitelist = ["0.0.0.0", "::1"];

    obj.apiKey = {
      live,
      test,
    };
    obj.security = { whitelist };

    const settings = await Setting.create({ userCount: 1000 });

    // TODO: Generate tenantId
    obj.tenantId = settings.userCount;

    const newTenant = await Tenant.create(obj);
    if (!newTenant) {
      throw new AppError(
        "internal server error. if this persist, please contact support",
        500
      );
    }

    return res.status(201).json({
      status: true,
      message: "new tenant created successfully",
      data: newTenant,
    });
  }
);

export const registerTenant = catchAsyncError(async (req, res) => {
  const query = { email: `tenant@${CONNECTION_NAME}.com` };

  const findTenant = await User.findOne(query);

  // Tenant exist
  if (findTenant) {
    throw new AppError(
      "please use existing account or choose another name",
      404
    );
  }

  const passwordHash = await bcrypt.hash("1234567", 10);

  const settings = await Setting.findOneAndUpdate(
    {},
    { $inc: { userCount: 1 } },
    { new: true }
  ).lean();

  const userId = settings.userCount;

  const newUser = await User.create({
    userId,
    password: passwordHash,
    role: "tenant",
    firstName: CONNECTION_NAME,
    lastName: CONNECTION_NAME,
    email: `tenant@${CONNECTION_NAME}.com`,
  });

  if (!newUser) {
    throw new AppError("Internal server error", 500);
  }

  return res.status(200).json({
    status: true,
    message: "new user created successfully",
    data: {
      username: newUser.username,
      role: newUser.role,
      firstName: newUser.firstName,
      lastName: newUser.lastName,
      id: newUser._id,
      userId: newUser.userId,
      createdAt: newUser.createdAt,
    },
  });
});

export const registerUser = catchAsyncError(async (req, res) => {
  const obj = req.body;

  const query = { email: obj.email };

  const user = await User.findOne(query);

  if (user) {
    throw new AppError("User already exist", 400);
  }

  const settings = await Setting.findOneAndUpdate(
    {},
    { $inc: { userCount: 1 } }
  ).lean();

  obj.userId = settings.userCount;

  if (obj.role === "tenant") {
    throw new AppError("no two user can have a role of tenant", 400);
  }

  const passwordHash = await bcrypt.hash(obj.password, 10);

  obj.password = passwordHash;

  const newUser = await User.create(obj);

  return res.status(200).json({
    status: true,
    message: "new user created succefully",
    data: {
      email: newUser.email,
      role: newUser.role,
      firstName: newUser.firstName,
      lastName: newUser.lastName,
      id: newUser.id,
      userId: newUser.userId,
      createdAt: newUser.createdAt,
    },
  });
});

export const loginUser = catchAsyncError(async (req, res) => {
  const obj = req.body;
  const query = {
    email: obj.email,
  };

  const user = await User.findOne(query).lean();

  if (!user) {
    throw new AppError("user does not exist", 404);
  }

  const isValidPassword = await bcrypt.compare(obj.password, user.password);

  if (!isValidPassword) {
    throw new AppError(
      "your username/password combination is not correct",
      401
    );
  }

  const { accessToken, refreshToken } = generateTokens({
    email: user.email,
    role: user.role,
    userId: user.userId,
    status: user.status,
  });

  user.accessToken = accessToken;
  user.refreshToken = refreshToken;
  user.password = undefined;

  return res.status(200).json({
    status: true,
    message: "user logged in successfully",
    data: user,
  });
});

export const getUsers = catchAsyncError(async (req, res) => {
  const obj = req.query;

  const { limit, page } = req.query;

  let query = {};
  for (const [key, value] of Object.entries(obj)) {
    if (key === "tenant" || key === "limit" || key === "page") {
      continue;
    }
    query = { ...query, [key]: value };
  }

  const options = {
    page,
    limit,
    sort: { createdAt: "desc" },
    collation: {
      locale: "en",
    },
    lean: true,
    projection: {
      password: 0,
    },
  };

  const users = await User.paginate(query, options);

  return res.status(200).json({
    status: true,
    message: "found user(s)",
    data: users.docs,
    meta: {
      total: users.totalDocs,
      skipped: users.page * users.limit,
      perPage: users.limit,
      page: users.page,
      pageCount: users.totalPages,
      hasNextPage: users.hasNextPage,
      hasPrevPage: users.hasPrevPage,
    },
  });
});

export const getUser = catchAsyncError(async (req, res) => {

  const query = { email: req.user.email };
  const user = await User.findOne(query).lean();

  return res.status(200).json({
    status: true,
    message: "found user(s)",
    data: user,
  });
});
