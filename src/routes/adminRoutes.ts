import { Router } from "express";
import {
  blockUserController,
  unblockUserController,
  makeUserAdminController,
  removeAdminController,
} from "../controllers/adminController";
import { authenticate } from "../middlewares/authMiddleware";
import { validateAdmin } from "../middlewares/validateAdmin";
import { getAllUsersController } from "../controllers/userController";

const router = Router();

// Routes for admin operations
// Route to get all users
router.get("/get-users", authenticate, validateAdmin, getAllUsersController);
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
