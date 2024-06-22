import { Request, Response, NextFunction } from "express";
import knex from "../utils/db";
import {
  createTransaction,
  getTransactionsByUserId,
  getPaginatedTransactionsByUserId,
} from "../models/transactionModel";
import { getUserById, updateUserBalance } from "../models/userModel";
import ApiError from "../middlewares/errorHandler";
import { TransactionRequestBody } from "../types";

// Controller to create a new transaction
export const createTransactionController = async (
  req: Request<{}, {}, TransactionRequestBody>,
  res: Response,
  next: NextFunction
) => {
  const { type, amount, recipient_id } = req.body;
  const userId = 22; //req.user?.id; // Assuming user ID is attached to req.user by an authentication middleware

  try {
    // Check if user exists
    const user = await getUserById(userId);
    if (!user) {
      return next(new ApiError(404, "User not found"));
    }

    // Perform transaction based on type
    switch (type) {
      case "fund":
        // Update user's balance
        // TODO: Ensure the amount is positive
        await updateUserBalance(userId, user.balance + amount);
        break;
      case "withdraw":
        // TODO: Ensure the amount is positive
        if (user.balance < amount) {
          return next(new ApiError(400, "Insufficient funds"));
        }
        await updateUserBalance(userId, user.balance - amount);
        break;
      case "transfer":
        if (!recipient_id) {
          return next(
            new ApiError(400, "Recipient ID is required for transfer")
          );
        }
        if (user.balance < amount) {
          return next(new ApiError(400, "Insufficient funds"));
        }
        const recipient = await getUserById(recipient_id);
        if (!recipient) {
          return next(new ApiError(404, "Recipient not found"));
        }
        await updateUserBalance(userId, user.balance - amount);
        await updateUserBalance(recipient_id, recipient.balance + amount);
        break;
      default:
        return next(new ApiError(400, "Invalid transaction type"));
    }

    // Create transaction record
    const transactionId = await createTransaction({
      user_id: userId,
      type,
      amount,
      recipient_id,
    });

    res.status(201).json({ message: "Transaction successful", transactionId });
  } catch (error) {
    next(new ApiError(500, "Error processing transaction"));
  }
};

// Controller to get transaction history for a user
export const getTransactionHistory = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const userId = 22; //req.user.id; // Assuming user ID is attached to req.user by an authentication middleware
  const { page = 1, limit = 10 } = req.query;

  try {
    const offset = (Number(page) - 1) * Number(limit);
    const transactions = await getPaginatedTransactionsByUserId(
      userId,
      Number(limit),
      offset
    );

    res.status(200).json(transactions);
  } catch (error) {
    next(new ApiError(500, "Error fetching transaction history"));
  }
};
