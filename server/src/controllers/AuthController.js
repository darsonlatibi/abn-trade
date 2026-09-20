import bcrypt from "bcryptjs";

import {
  loginUser,
  refreshAccessToken,
  getCurrentUser,
} from "../services/authService.js";

import User from "../models/User.js";

function sanitizeUser(user) {
  if (!user) return null;

  const data = user.toJSON ? user.toJSON() : { ...user };

  delete data.password_hash;

  return data;
}

/**
 * POST /api/auth/register
 *
 * Public registration.
 */
export async function register(req, res) {
  try {
    const { full_name, email, password } = req.body;

    if (!full_name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: "Nama lengkap, email, dan password wajib diisi.",
      });
    }

    if (password.length < 8) {
      return res.status(400).json({
        success: false,
        message: "Password minimal 8 karakter.",
      });
    }

    const normalizedEmail = String(email).trim().toLowerCase();

    const existingEmail = await User.findOne({
      where: {
        email: normalizedEmail,
      },
    });

    if (existingEmail) {
      return res.status(409).json({
        success: false,
        message: "Email sudah terdaftar.",
      });
    }

    /*
     * Username dibuat otomatis dari bagian sebelum @.
     *
     * contoh:
     * darson@gmail.com
     *     ↓
     * darson
     */
    let baseUsername = normalizedEmail
      .split("@")[0]
      .toLowerCase()
      .replace(/[^a-z0-9_]/g, "")
      .slice(0, 40);

    if (!baseUsername) {
      baseUsername = "user";
    }

    let username = baseUsername;
    let counter = 1;

    while (await User.findOne({ where: { username } })) {
      username = `${baseUsername}${counter}`;
      counter++;
    }

    const password_hash = await bcrypt.hash(password, 12);

    const user = await User.create({
      username,
      email: normalizedEmail,
      password_hash,
      full_name: String(full_name).trim(),
      role: "VIEWER",
      status: "ACTIVE",
      tenant_id: null,
    });

    return res.status(201).json({
      success: true,
      message: "Registration successful.",
      data: {
        user: sanitizeUser(user),
      },
    });
  } catch (error) {
    console.error("Registration error:", error);

    if (error.name === "SequelizeUniqueConstraintError") {
      return res.status(409).json({
        success: false,
        message: "Username atau email sudah terdaftar.",
      });
    }

    if (error.name === "SequelizeValidationError") {
      return res.status(400).json({
        success: false,
        message: error.errors.map((item) => item.message).join(", "),
      });
    }

    return res.status(500).json({
      success: false,
      message: "Failed to register user.",
    });
  }
}

/**
 * POST /api/auth/login
 */
export async function login(req, res) {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Email dan password wajib diisi.",
      });
    }

    const result = await loginUser({
      email,
      password,
    });

    return res.status(200).json({
      success: true,
      message: "Login successful.",
      data: result,
    });
  } catch (error) {
    console.error("========================================");
    console.error("ABN TRADE LOGIN ERROR");
    console.error("name:", error?.name);
    console.error("message:", error?.message);
    console.error("stack:", error?.stack);
    console.error("========================================");

    return res.status(500).json({
      success: false,
      message: "Internal server error.",
    });
  }
}

/**
 * POST /api/auth/refresh
 */
export async function refresh(req, res) {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      return res.status(400).json({
        success: false,
        message: "Refresh token is required.",
      });
    }

    const result = await refreshAccessToken(refreshToken);

    return res.status(200).json({
      success: true,
      message: "Token refreshed successfully.",
      data: result,
    });
  } catch (error) {
    console.error("Auth refresh error:", error);

    return res.status(error.statusCode || 401).json({
      success: false,
      message: error.statusCode ? error.message : "Invalid refresh token.",
    });
  }
}

/**
 * GET /api/auth/me
 */
export async function me(req, res) {
  try {
    if (!req.user?.id) {
      return res.status(401).json({
        success: false,
        message: "Authentication required.",
      });
    }

    const user = await getCurrentUser(req.user.id);

    return res.status(200).json({
      success: true,
      data: { user },
    });
  } catch (error) {
    console.error("Auth me error:", error);

    return res.status(error.statusCode || 500).json({
      success: false,
      message: error.statusCode ? error.message : "Internal server error.",
    });
  }
}

/**
 * POST /api/auth/logout
 */
export async function logout(req, res) {
  return res.status(200).json({
    success: true,
    message: "Logout successful.",
  });
}

