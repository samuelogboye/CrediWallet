import { Response, NextFunction } from "express";
import {
  createTransaction,
  getPaginatedTransactionsByUserId,
  isDuplicateTransaction,
  getTransactionById,
} from "../models/transactionModel";
import {
  getUserByAccountNumber,
  getUserByEmail,
  getUserById,
  updateUserBalance,
} from "../models/userModel";
import ApiError from "../middlewares/errorHandler";
import { AuthenticatedRequest, TransactionRequestBody, User } from "../types";
import { validateAmount } from "../utils/validator";
import transferEventEmitter from "../events/transferEvents";
import logger from "../config/logger";
import knex from "../utils/db";

// Controller to fund an account
export const fundAccountController = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  logger.info("transactionController.fundAccountController(): Function Entry");

  const { amount } = req.body as TransactionRequestBody;
  const userId = req.user.id;

  const trx = await knex.transaction();

  try {
    const user = await getUserById(userId, trx);
    if (!user) {
      await trx.rollback();
      return next(new ApiError(404, "User not found"));
    }

    await validateAmount(amount, userId, next);
    if (res.headersSent) return;

    const amount_to_update = Number(user.balance) + Number(amount);

    await updateUserBalance(userId, amount_to_update, trx);

    const transactionId = await createTransaction(
      {
        user_id: userId,
        type: "fund",
        money_in: amount,
        money_out: 0,
        recipient_to_from: "self",
        description: "Account funded",
        balance: amount_to_update,
      },
      trx
    );

    await trx.commit();

    res.status(201).json({
      message: "Account funded successfully",
      transactionId,
      currentBalance: amount_to_update,
      userName: user.name,
    });
  } catch (error) {
    await trx.rollback();
    const err = error as Error;
    logger.error(
      `Error funding account for user with ID ${userId}: ${err.message}`
    );
    next(new ApiError(500, "Error funding account"));
  } finally {
    logger.info("transactionController.fundAccountController(): Function Exit");
  }
};

// Controller to transfer funds
export const transferController = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  logger.info("transactionController.transferController(): Function Entry");

  const {
    type,
    amount,
    recipient_id,
    recipient_account_number,
    recipient_email,
    description,
  } = req.body as TransactionRequestBody;

  const userId = req.user.id;

  const trx = await knex.transaction();

  try {
    const user = await getUserById(userId, trx);
    if (!user) {
      await trx.rollback();
      return next(new ApiError(404, "User not found"));
    }

    await validateAmount(amount, userId, next);

    let recipient: Partial<User>;
    let recipientIdentifier;

    if (recipient_id) {
      logger.info(`Checking if recipient with ID ${recipient_id} exists`);
      recipient = await getUserById(recipient_id, trx);
      recipientIdentifier = { recipient_id };
      if (recipient && recipient.id === user.id) {
        await trx.rollback();
        logger.warn(`User with ID ${userId} tried to transfer to self`);
        return next(new ApiError(400, "Cannot create transaction with self"));
      }
    } else if (recipient_account_number) {
      logger.info(
        `Checking if recipient with account number ${recipient_account_number} exists`
      );
      recipient = await getUserByAccountNumber(recipient_account_number);
      recipientIdentifier = { recipient_account_number };
      if (recipient && recipient.account_number === user.account_number) {
        await trx.rollback();
        logger.warn(`User with ID ${userId} tried to transfer to self`);
        return next(new ApiError(400, "Cannot create transaction with self"));
      }
    } else if (recipient_email) {
      logger.info(`Checking if recipient with email ${recipient_email} exists`);
      (recipient = await getUserByEmail(recipient_email)), false;
      recipientIdentifier = { recipient_email };
      if (recipient && recipient.email === user.email) {
        await trx.rollback();
        logger.warn(`User with ID ${userId} tried to transfer to self`);
        return next(new ApiError(400, "Cannot create transaction with self"));
      }
    }

    if (!recipient) {
      await trx.rollback();
      return next(new ApiError(404, "Recipient not found"));
    }

    if (user.balance < amount) {
      await trx.rollback();
      return next(new ApiError(400, "Insufficient funds"));
    }

    const isDuplicate = await isDuplicateTransaction(
      userId,
      recipient.id,
      amount,
      type,
      trx
    );
    if (isDuplicate) {
      await trx.rollback();
      logger.warn(`Duplicate transaction detected for user with ID ${userId}`);
      return next(
        new ApiError(
          400,
          "Duplicate transaction: Please wait at least 30 seconds before repeating the same transaction"
        )
      );
    }

    const senderBalance = user.balance - amount;
    const recipientBalance = Number(recipient.balance) + amount;

    await updateUserBalance(userId, senderBalance, trx);
    await updateUserBalance(recipient.id, recipientBalance, trx);

    const senderTransactionId = await createTransaction(
      {
        type: "transfer",
        user_id: userId,
        money_out: amount,
        money_in: 0,
        recipient_to_from: recipient.name + "/" + recipient.account_number,
        description: description
          ? description
          : "Transfer to " + recipient.name,
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
        recipient_id: userId,
      },
      trx
    );

    await trx.commit();

    const transaction = await getTransactionById(senderTransactionId, trx);

    transferEventEmitter.emit("transferMade", user, recipient, amount);

    logger.info(`Transfer successful for user with ID ${userId}`);
    res.status(201).json({
      message: "Transfer successful",
      transaction,
    });
  } catch (error) {
    await trx.rollback();
    const err = error as Error;
    logger.error(
      `Error processing transfer for user with ID ${userId}: ${err.message}`
    );
    next(new ApiError(500, "Error processing transfer"));
  } finally {
    logger.info("transactionController.transferController(): Function Exit");
  }
};

// Controller to withdraw funds
export const withdrawController = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  logger.info("transactionController.withdrawController(): Function Entry");

  const { amount } = req.body as TransactionRequestBody;
  const userId = req.user.id;

  const trx = await knex.transaction();

  try {
    // Check if user exists
    logger.info(`Checking if user with ID ${userId} exists`);
    const user = await getUserById(userId);
    if (!user) {
      await trx.rollback();
      logger.warn(`User with ID ${userId} not found`);
      return next(new ApiError(404, "User not found"));
    }

    // Validate amount
    logger.info(`Validating amount: ${amount}`);
    await validateAmount(amount, userId, next);

    // Check for sufficient funds
    logger.info(`Checking if user with ID ${userId} has sufficient funds`);
    if (user.balance < amount) {
      await trx.rollback();
      logger.warn(`User with ID ${userId} has insufficient funds`);
      return next(new ApiError(400, "Insufficient funds"));
    }

    // Withdraw funds
    logger.info(`Withdrawing funds for user with ID ${userId}`);
    const amount_to_update = Number(user.balance) - Number(amount);
    await updateUserBalance(userId, amount_to_update, trx);

    // Create transaction record
    logger.info(`Creating transaction record for user with ID ${userId}`);
    const transactionId = await createTransaction(
      {
        user_id: userId,
        type: "withdraw",
        money_out: amount,
        money_in: 0,
        recipient_to_from: "self",
        description: "Withdrawal",
        balance: amount_to_update,
      },
      trx
    );
    await trx.commit();

    logger.info(`Withdrawal successful for user with ID ${userId}`);
    res.status(201).json({
      message: "Withdrawal successful",
      transactionId,
      amounWithdrawn: amount,
      balanceBefore: user.balance,
      finalBalance: amount_to_update,
      userName: user.name,
    });
  } catch (error) {
    await trx.rollback();
    const err = error as Error;
    logger.error(
      `Error processing withdrawal for user with ID ${userId}: ${err.message}`
    );
    next(new ApiError(500, "Error processing withdrawal"));
  } finally {
    logger.info("transactionController.withdrawController(): Function Exit");
  }
};

// Controller to get transaction history for a user
export const getTransactionHistory = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  logger.info("transactionController.getTransactionHistory(): Function Entry");

  const userId = req.user.id;
  const { page = 1, limit = 10 } = req.query;

  try {
    const offset = (Number(page) - 1) * Number(limit);
    logger.info(`Fetching transaction history for user with ID ${userId}`);
    const transactions = await getPaginatedTransactionsByUserId(
      userId,
      Number(limit),
      offset
    );

    logger.info(
      `Transaction history retrieved successfully for user with ID ${userId}`
    );
    res.status(200).json({
      message: "Transaction history retrieved successfully",
      userData: req.user,
      transactionCount: transactions.length,
      transactions,
    });
  } catch (error) {
    const err = error as Error;
    logger.error(
      `Error fetching transaction history for user with ID ${userId}: ${err.message}`
    );
    next(new ApiError(500, "Error fetching transaction history"));
  } finally {
    logger.info("transactionController.getTransactionHistory(): Function Exit");
  }
};

// Controller to get transaction by id
export const getTransactionByIdController = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  logger.info(
    "transactionController.getTransactionByIdController(): Function Entry"
  );

  const userId = req.user.id;
  const transactionId = req.params.id;

  try {
    logger.info(
      `Fetching transaction with ID ${transactionId} for user with ID ${userId}`
    );
    const transaction = await getTransactionById(Number(transactionId));

    if (!transaction) {
      logger.warn(`Transaction with ID ${transactionId} not found`);
      return next(new ApiError(404, "Transaction not found"));
    }

    logger.info(
      `Transaction with ID ${transactionId} retrieved successfully for user with ID ${userId}`
    );
    res.status(200).json({
      message: "Transaction retrieved successfully",
      userData: req.user,
      transaction,
    });
  } catch (error) {
    const err = error as Error;
    logger.error(
      `Error fetching transaction with ID ${transactionId} for user with ID ${userId}: ${err.message}`
    );
    next(new ApiError(500, "Error fetching transaction"));
  } finally {
    logger.info(
      "transactionController.getTransactionByIdController(): Function Exit"
    );
  }
};
