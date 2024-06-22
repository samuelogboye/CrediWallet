import { Router } from "express";
// import { register, login } from "../controllers/authController";
import { register } from "../controllers/authController";
import { checkBlacklist } from "../middlewares/authMiddleware";

const router = Router();

// Route to register a new user
router.post("/register", checkBlacklist, register);

// Route to log in an existing user
// router.post("/login", login);

export default router;
