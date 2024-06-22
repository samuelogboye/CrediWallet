import { Router } from "express";
import {
  createTransactionController,
  getTransactionHistory,
} from "../controllers/transactionController";
import { validateTransaction } from "../utils/validator";
import { authenticate } from "../middlewares/authMiddleware"; // Assuming you have an authentication middleware

const router = Router();

// Route to create a new transaction
router.post(
  "/",
  authenticate,
  validateTransaction,
  createTransactionController
);

// Route to get transaction history
router.get("/", authenticate, getTransactionHistory);

export default router;
