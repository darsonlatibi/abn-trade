import { Router } from "express";

import {
  register,
  login,
  refresh,
  me,
  logout,
} from "../controllers/AuthController.js";

import { authenticate } from "../middleware/authMiddleware.js";

/* =========================================================
   ABN TRADE
   AUTH ROUTES
   ========================================================= */

const router = Router();

/* =========================================================
   PUBLIC ROUTES
   ========================================================= */

/**
 * POST /api/auth/login
 *
 * Login menggunakan email + password.
 */
router.post("/login", login);

router.post("/register", register);

/**
 * POST /api/auth/refresh
 *
 * Membuat access token baru.
 */
router.post("/refresh", refresh);

/* =========================================================
   PROTECTED ROUTES
   ========================================================= */

/**
 * GET /api/auth/me
 *
 * Mengambil informasi user yang sedang login.
 */
router.get("/me", authenticate, me);

/**
 * POST /api/auth/logout
 *
 * Logout user.
 */
router.post("/logout", authenticate, logout);

export default router;
