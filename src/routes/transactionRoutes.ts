import { Router } from "express";
import {
  fundAccountController,
  getTransactionByIdController,
  getTransactionHistory,
  sendStatementController,
  transferController,
  withdrawController,
} from "../controllers/transactionController";
import { validateTransaction } from "../utils/validator";
import { authenticate } from "../middlewares/authMiddleware"; // Assuming you have an authentication middleware

const router = Router();

// Route to fund an account
router.post("/fund", authenticate, validateTransaction, fundAccountController);

// Route to transfer funds
router.post("/transfer", authenticate, validateTransaction, transferController);

// Route to withdraw funds
router.post("/withdraw", authenticate, validateTransaction, withdrawController);

// Route to send statement of account to email
router.get("/statement", authenticate, sendStatementController);

// Route to get transaction history
router.get("/", authenticate, getTransactionHistory);

// Route to get transaction by id
router.get("/:id", authenticate, getTransactionByIdController);

export default router;
