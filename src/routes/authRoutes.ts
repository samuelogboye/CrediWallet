import { Router } from "express";
import { register, login } from "../controllers/authController";
import { checkBlacklist } from "../middlewares/authMiddleware";
import { validateRegister, validateLogin } from "../utils/validator";

const router = Router();

// Route to register a new user
router.post("/register", validateRegister, checkBlacklist, register);

// Route to log in an existing user
router.post("/login", validateLogin, login);

export default router;
