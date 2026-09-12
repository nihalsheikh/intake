import { Router } from "express";
import { protect } from "../middleware/auth.middleware";
import {
  register,
  login,
  getMe,
  patchProfile,
  patchPassword,
  deleteAccount,
} from "../controllers/auth.controller";

const router = Router();

// Public Routes
router.post("/register", register);
router.post("/login", login);

// Protected Routes
router.get("/me", protect, getMe);
router.put("/profile", protect, patchProfile);
router.put("/password", protect, patchPassword);
router.delete("/me", protect, deleteAccount);

export default router;
