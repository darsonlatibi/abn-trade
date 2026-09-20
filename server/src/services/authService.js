import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

import User from "../models/User.js";
import { env } from "../config/env.js";

/* =========================================================
   ABN TRADE
   AUTH SERVICE
   ========================================================= */

function createAccessToken(user) {
  if (!env.jwt.accessSecret) {
    throw new Error("JWT_ACCESS_SECRET is not configured.");
  }

  return jwt.sign(
    {
      sub: String(user.id),
      email: user.email,
      role: user.role,
      type: "access",
    },
    env.jwt.accessSecret,
    {
      expiresIn: env.jwt.accessExpiresIn,
    },
  );
}

function createRefreshToken(user) {
  if (!env.jwt.refreshSecret) {
    throw new Error("JWT_REFRESH_SECRET is not configured.");
  }

  return jwt.sign(
    {
      sub: String(user.id),
      email: user.email,
      role: user.role,
      type: "refresh",
    },
    env.jwt.refreshSecret,
    {
      expiresIn: env.jwt.refreshExpiresIn,
    },
  );
}

function sanitizeUser(user) {
  if (!user) {
    return null;
  }

  const data = user.toJSON ? user.toJSON() : { ...user };

  delete data.password_hash;

  return data;
}

/* =========================================================
   LOGIN
   ========================================================= */

export async function loginUser({ email, password }) {
  const normalizedEmail = String(email).trim().toLowerCase();

  const user = await User.findOne({
    where: {
      email: normalizedEmail,
    },
  });

  if (!user) {
    const error = new Error("Invalid email or password.");
    error.statusCode = 401;
    throw error;
  }

  if (user.status !== "ACTIVE") {
    const error = new Error("User account is not active.");
    error.statusCode = 403;
    throw error;
  }

  const passwordValid = await bcrypt.compare(password, user.password_hash);

  if (!passwordValid) {
    const error = new Error("Invalid email or password.");
    error.statusCode = 401;
    throw error;
  }

  const accessToken = createAccessToken(user);
  const refreshToken = createRefreshToken(user);

  return {
    user: sanitizeUser(user),
    accessToken,
    refreshToken,
    expiresIn: env.jwt.accessExpiresIn,
  };
}

/* =========================================================
   REFRESH ACCESS TOKEN
   ========================================================= */

export async function refreshAccessToken(refreshToken) {
  if (!env.jwt.refreshSecret) {
    throw new Error("JWT_REFRESH_SECRET is not configured.");
  }

  let decoded;

  try {
    decoded = jwt.verify(refreshToken, env.jwt.refreshSecret);
  } catch (error) {
    const authError = new Error(
      error.name === "TokenExpiredError"
        ? "Refresh token expired."
        : "Invalid refresh token.",
    );

    authError.statusCode = 401;

    throw authError;
  }

  if (!decoded || decoded.type !== "refresh" || !decoded.sub) {
    const error = new Error("Invalid refresh token.");
    error.statusCode = 401;
    throw error;
  }

  const user = await User.findByPk(decoded.sub);

  if (!user) {
    const error = new Error("User account not found.");
    error.statusCode = 401;
    throw error;
  }

  if (user.status !== "ACTIVE") {
    const error = new Error("User account is not active.");
    error.statusCode = 403;
    throw error;
  }

  const newAccessToken = createAccessToken(user);
  const newRefreshToken = createRefreshToken(user);

  return {
    user: sanitizeUser(user),
    accessToken: newAccessToken,
    refreshToken: newRefreshToken,
    expiresIn: env.jwt.accessExpiresIn,
  };
}

/* =========================================================
   CURRENT USER
   ========================================================= */

export async function getCurrentUser(userId) {
  const user = await User.findByPk(userId, {
    attributes: {
      exclude: ["password_hash"],
    },
  });

  if (!user) {
    const error = new Error("User account not found.");
    error.statusCode = 404;
    throw error;
  }

  if (user.status !== "ACTIVE") {
    const error = new Error("User account is not active.");
    error.statusCode = 403;
    throw error;
  }

  return sanitizeUser(user);
}
