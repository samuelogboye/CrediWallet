import logger from "../config/logger";
import { NextFunction } from "express";
import ApiError from "../middlewares/errorHandler";
import { createTransaction } from "../models/transactionModel";
import {
  getUserByAccountNumber,
  getUserByEmail,
  getUserById,
  updateUserBalance,
} from "../models/userModel";
import { User } from "../types";

export const getUser = async (userId: number, trx: any, next: NextFunction) => {
  logger.info(`[transactionController]: Fetching user by ID: ${userId}`);
  const user = await getUserById(userId, trx);
  if (!user) {
    logger.warn(`User with ID ${userId} not found`);
    await trx.rollback();
    next(new ApiError(404, "User not found"));
  }
  return user;
};

export const getRecipient = async (
  recipientData: any,
  user: any,
  trx: any,
  next: NextFunction
) => {
  const { recipient_id, recipient_account_number, recipient_email } =
    recipientData;
  let recipient: Partial<User>;
  let recipientIdentifier;

  if (recipient_id) {
    recipient = await getUserById(recipient_id, trx);
    recipientIdentifier = { recipient_id };
  } else if (recipient_account_number) {
    recipient = await getUserByAccountNumber(recipient_account_number);
    recipientIdentifier = { recipient_account_number };
  } else if (recipient_email) {
    recipient = await getUserByEmail(recipient_email);
    recipientIdentifier = { recipient_email };
  } else {
    next(new ApiError(404, "Recipient search parameter not valid"));
    return null;
  }

  if (recipient && recipient.id === user.id) {
    await trx.rollback();
    logger.warn(`User with ID ${user.id} tried to transfer to self`);
    next(new ApiError(400, "Cannot create transaction with self"));
    return null;
  }

  if (!recipient) {
    logger.warn("Recipient not found");
    await trx.rollback();
    next(new ApiError(404, "Recipient not found"));
    return null;
  }

  return { recipient, recipientIdentifier };
};

export const validateFunds = async (
  user: any,
  amount: number,
  trx: any,
  next: NextFunction
) => {
  if (user.balance < amount) {
    logger.warn(`Insufficient funds for user with ID ${user.id}`);
    await trx.rollback();
    next(new ApiError(400, "Insufficient funds"));
    return false;
  }
  return true;
};

export const processTransaction = async (
  user: any,
  recipient: any,
  amount: number,
  description: string,
  trx: any
) => {
  const senderBalance = user.balance - amount;
  const recipientBalance = Number(recipient.balance) + amount;

  await updateUserBalance(user.id, senderBalance, trx);
  await updateUserBalance(recipient.id, recipientBalance, trx);

  const senderTransactionId = await createTransaction(
    {
      type: "transfer",
      user_id: user.id,
      money_out: amount,
      money_in: 0,
      recipient_to_from: recipient.name + "/" + recipient.account_number,
      description: description ? description : "Transfer to " + recipient.name,
      balance: senderBalance,
      recipient_id: recipient.id,
    },
    trx
  );

  const recipientTransactionId = await createTransaction(
    {
      type: "fund",
      user_id: recipient.id,
      money_out: 0,
      money_in: amount,
      recipient_to_from: user.name + "/" + user.account_number,
      description: description ? description : "Fund from " + user.name,
      balance: recipientBalance,
      recipient_id: user.id,
    },
    trx
  );

  await trx.commit();
  return { senderTransactionId, recipientTransactionId };
};

export const handleError = async (
  error: any,
  trx: any,
  userId: number,
  next: NextFunction
) => {
  if (!trx.isCompleted()) {
    await trx.rollback();
  }
  const err = error as Error;
  logger.error(
    `Error processing transfer for user with ID ${userId}: ${err.message}`
  );
  next(new ApiError(500, "Error processing transfer"));
};
