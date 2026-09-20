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

router.get("/", authenticate, getUsers);

router.get("/:id", authenticate, getUserById);

router.post("/", authenticate, createUser);

router.put("/:id", authenticate, updateUser);

router.delete("/:id", authenticate, deleteUser);

export default router;
