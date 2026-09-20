import { Router } from "express";

import {
  getUsers,
  getUserById,
  createUser,
  updateUser,
  deleteUser,
} from "../controllers/UserController.js";

import { authenticate } from "../middleware/authMiddleware.js";

/* =========================================================
   ABN TRADE
   USER ROUTES
   ========================================================= */

const router = Router();

/* =========================================================
   PROTECTED CRUD ROUTES
   ========================================================= */

/**
 * GET /api/users
 *
 * Get all users.
 */
router.get("/", authenticate, getUsers);

/**
 * GET /api/users/:id
 *
 * Get user by ID.
 */
router.get("/:id", authenticate, getUserById);

/**
 * POST /api/users
 *
 * Create new user.
 */
router.post("/", authenticate, createUser);

/**
 * PUT /api/users/:id
 *
 * Update existing user.
 */
router.put("/:id", authenticate, updateUser);

/**
 * DELETE /api/users/:id
 *
 * Delete user.
 */
router.delete("/:id", authenticate, deleteUser);

export default router;
