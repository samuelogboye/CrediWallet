import { Router } from "express";
import {
  registerController,
  loginController,
} from "../controllers/authController";
import { checkBlacklist } from "../middlewares/authMiddleware";
import { validateRegister, validateLogin } from "../utils/validator";

const router = Router();

router.post("/register", validateRegister, checkBlacklist, registerController);

router.post("/login", validateLogin, loginController);

export default router;
