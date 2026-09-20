import bcrypt from "bcryptjs";
import User from "../models/User.js";

/* =========================================================
   ABN TRADE
   USER CONTROLLER
   ========================================================= */

/* =========================================================
   HELPER
   ========================================================= */

function sanitizeUser(user) {
  if (!user) {
    return null;
  }

  const data = user.toJSON ? user.toJSON() : { ...user };

  delete data.password_hash;

  return data;
}

function getErrorStatus(error) {
  if (error.name === "SequelizeUniqueConstraintError") {
    return 409;
  }

  if (error.name === "SequelizeValidationError") {
    return 400;
  }

  return error.statusCode || 500;
}

/* =========================================================
   GET ALL USERS
   GET /api/users
   ========================================================= */

export async function getUsers(req, res) {
  try {
    const users = await User.findAll({
      attributes: {
        exclude: ["password_hash"],
      },

      order: [["id", "DESC"]],
    });

    return res.status(200).json({
      success: true,
      data: {
        users,
        count: users.length,
      },
    });
  } catch (error) {
    console.error("Get users error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to retrieve users.",
    });
  }
}

/* =========================================================
   GET USER BY ID
   GET /api/users/:id
   ========================================================= */

export async function getUserById(req, res) {
  try {
    const { id } = req.params;

    const user = await User.findByPk(id, {
      attributes: {
        exclude: ["password_hash"],
      },
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found.",
      });
    }

    return res.status(200).json({
      success: true,
      data: {
        user,
      },
    });
  } catch (error) {
    console.error("Get user by ID error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to retrieve user.",
    });
  }
}

/* =========================================================
   CREATE USER
   POST /api/users
   ========================================================= */

export async function createUser(req, res) {
  try {
    const { username, email, password, full_name, role, status, tenant_id } =
      req.body;

    /* -----------------------------------------------------
       REQUIRED FIELDS
       ----------------------------------------------------- */

    if (!username || !email || !password || !full_name) {
      return res.status(400).json({
        success: false,
        message: "Username, email, password, and full name are required.",
      });
    }

    /* -----------------------------------------------------
       PASSWORD VALIDATION
       ----------------------------------------------------- */

    if (password.length < 8) {
      return res.status(400).json({
        success: false,
        message: "Password must contain at least 8 characters.",
      });
    }

    /* -----------------------------------------------------
       CHECK USERNAME
       ----------------------------------------------------- */

    const existingUsername = await User.findOne({
      where: {
        username,
      },
    });

    if (existingUsername) {
      return res.status(409).json({
        success: false,
        message: "Username already exists.",
      });
    }

    /* -----------------------------------------------------
       CHECK EMAIL
       ----------------------------------------------------- */

    const existingEmail = await User.findOne({
      where: {
        email,
      },
    });

    if (existingEmail) {
      return res.status(409).json({
        success: false,
        message: "Email already exists.",
      });
    }

    /* -----------------------------------------------------
       HASH PASSWORD
       ----------------------------------------------------- */

    const password_hash = await bcrypt.hash(password, 12);

    /* -----------------------------------------------------
       CREATE USER
       ----------------------------------------------------- */

    const user = await User.create({
      username,
      email,
      password_hash,
      full_name,
      role: role || "VIEWER",
      status: status || "ACTIVE",
      tenant_id: tenant_id === undefined ? null : tenant_id,
    });

    return res.status(201).json({
      success: true,
      message: "User created successfully.",
      data: {
        user: sanitizeUser(user),
      },
    });
  } catch (error) {
    console.error("Create user error:", error);

    return res.status(getErrorStatus(error)).json({
      success: false,
      message:
        error.name === "SequelizeUniqueConstraintError"
          ? "Username or email already exists."
          : error.name === "SequelizeValidationError"
            ? error.errors.map((item) => item.message).join(", ")
            : "Failed to create user.",
    });
  }
}

/* =========================================================
   UPDATE USER
   PUT /api/users/:id
   ========================================================= */

export async function updateUser(req, res) {
  try {
    const { id } = req.params;

    const { username, email, password, full_name, role, status, tenant_id } =
      req.body;

    /* -----------------------------------------------------
       FIND USER
       ----------------------------------------------------- */

    const user = await User.findByPk(id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found.",
      });
    }

    /* -----------------------------------------------------
       USERNAME
       ----------------------------------------------------- */

    if (username !== undefined && username !== user.username) {
      const existingUsername = await User.findOne({
        where: {
          username,
        },
      });

      if (existingUsername && String(existingUsername.id) !== String(id)) {
        return res.status(409).json({
          success: false,
          message: "Username already exists.",
        });
      }

      user.username = username;
    }

    /* -----------------------------------------------------
       EMAIL
       ----------------------------------------------------- */

    if (email !== undefined && email !== user.email) {
      const existingEmail = await User.findOne({
        where: {
          email,
        },
      });

      if (existingEmail && String(existingEmail.id) !== String(id)) {
        return res.status(409).json({
          success: false,
          message: "Email already exists.",
        });
      }

      user.email = email;
    }

    /* -----------------------------------------------------
       PASSWORD
       ----------------------------------------------------- */

    if (password !== undefined) {
      if (password.length < 8) {
        return res.status(400).json({
          success: false,
          message: "Password must contain at least 8 characters.",
        });
      }

      user.password_hash = await bcrypt.hash(password, 12);
    }

    /* -----------------------------------------------------
       OTHER FIELDS
       ----------------------------------------------------- */

    if (full_name !== undefined) {
      user.full_name = full_name;
    }

    if (role !== undefined) {
      user.role = role;
    }

    if (status !== undefined) {
      user.status = status;
    }

    if (tenant_id !== undefined) {
      user.tenant_id = tenant_id;
    }

    await user.save();

    return res.status(200).json({
      success: true,
      message: "User updated successfully.",
      data: {
        user: sanitizeUser(user),
      },
    });
  } catch (error) {
    console.error("Update user error:", error);

    return res.status(getErrorStatus(error)).json({
      success: false,
      message:
        error.name === "SequelizeUniqueConstraintError"
          ? "Username or email already exists."
          : error.name === "SequelizeValidationError"
            ? error.errors.map((item) => item.message).join(", ")
            : "Failed to update user.",
    });
  }
}

/* =========================================================
   DELETE USER
   DELETE /api/users/:id
   ========================================================= */

export async function deleteUser(req, res) {
  try {
    const { id } = req.params;

    const user = await User.findByPk(id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found.",
      });
    }

    /* -----------------------------------------------------
       PREVENT SELF DELETE
       ----------------------------------------------------- */

    if (req.user?.id && String(req.user.id) === String(id)) {
      return res.status(400).json({
        success: false,
        message: "You cannot delete your own account.",
      });
    }

    /* -----------------------------------------------------
       PROTECT SUPER ADMIN
       ----------------------------------------------------- */

    if (user.role === "SUPER_ADMIN") {
      return res.status(403).json({
        success: false,
        message: "SUPER_ADMIN accounts cannot be deleted.",
      });
    }

    await user.destroy();

    return res.status(200).json({
      success: true,
      message: "User deleted successfully.",
    });
  } catch (error) {
    console.error("Delete user error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to delete user.",
    });
  }
}
