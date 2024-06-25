import { Router } from "express";
import {
  fundAccountController,
  getTransactionHistory,
  transferController,
  withdrawController,
} from "../controllers/transactionController";
import { validateTransaction } from "../utils/validator";
import { authenticate } from "../middlewares/authMiddleware"; // Assuming you have an authentication middleware

const router = Router();

// // Route to create a new transaction
// router.post(
//   "/",
//   authenticate,
//   validateTransaction,
//   createTransactionController
// );
// Route to fund an account
router.post("/fund", authenticate, fundAccountController);

// Route to transfer funds
router.post("/transfer", authenticate, transferController);

// Route to withdraw funds
router.post("/withdraw", authenticate, withdrawController);

// Route to get transaction history
router.get("/", authenticate, getTransactionHistory);

export default router;
