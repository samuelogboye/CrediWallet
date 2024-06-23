import { Router } from "express";
import {
  blockUserController,
  unblockUserController,
  makeUserAdminController,
  removeAdminController,
} from "../controllers/adminController";
import { authenticate } from "../middlewares/authMiddleware";
import { validateAdmin } from "../middlewares/validateAdmin";

const router = Router();

// Routes for admin operations
router.put("/block/:userId", authenticate, validateAdmin, blockUserController);
router.put(
  "/unblock/:userId",
  authenticate,
  validateAdmin,
  unblockUserController
);
router.put(
  "/make-admin/:userId",
  authenticate,
  validateAdmin,
  makeUserAdminController
);
router.put(
  "/remove-admin/:userId",
  authenticate,
  validateAdmin,
  removeAdminController
);

export default router;
