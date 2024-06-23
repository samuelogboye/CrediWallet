import { Router } from "express";
import {
  getUserDetailsController,
  updateUserDetailsController,
  deleteUserController,
  getAllUsersController,
} from "../controllers/userController";
import { authenticate } from "../middlewares/authMiddleware";

const router = Router();

// Route to get user details
router.get("/me", authenticate, getUserDetailsController);

// Route to get all users
router.get("/", authenticate, getAllUsersController);

// Route to update user details
router.put("/me", authenticate, updateUserDetailsController);

// Route to delete user account
router.delete("/me", authenticate, deleteUserController);

export default router;
