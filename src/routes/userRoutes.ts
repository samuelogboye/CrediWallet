import { Router } from "express";
import {
  getUserDetailsController,
  updateUserDetailsController,
  deleteUserController,
  getUserByAccountNumberController,
} from "../controllers/userController";
import { authenticate } from "../middlewares/authMiddleware";

const router = Router();

// Route to get user details
router.get("/me", authenticate, getUserDetailsController);

// Route to update user details
router.put("/me", authenticate, updateUserDetailsController);

// Route to delete user account
router.delete("/me", authenticate, deleteUserController);

// Route to get Users name using account number
router.get(
  "/account/:accountNumber",
  authenticate,
  getUserByAccountNumberController
);

export default router;
