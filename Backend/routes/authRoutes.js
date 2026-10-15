import { Router } from "express";
import rateLimit from "express-rate-limit";
import {
  currentAdmin,
  login,
  registerAdmin,
  setupStatus,
} from "../controllers/authController.js";
import { requireAuth } from "../middleware/auth.js";

const router = Router();

const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 10,
  standardHeaders: "draft-7",
  legacyHeaders: false,
  message: { error: "Too many sign-in attempts. Try again in 15 minutes." },
});

const registrationLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 5,
  standardHeaders: "draft-7",
  legacyHeaders: false,
  message: { error: "Too many administrator setup attempts. Try again in 15 minutes." },
});

router.get("/setup-status", setupStatus);
router.post("/register", registrationLimiter, registerAdmin);
router.post("/login", loginLimiter, login);
router.get("/me", requireAuth, currentAdmin);

export default router;
