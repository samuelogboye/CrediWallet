import { Response, NextFunction } from "express";
import {
  createTransaction,
  getPaginatedTransactionsByUserId,
  isDuplicateTransaction,
  getTransactionById,
  getTransactionMetrics,
} from "../models/transactionModel";
import {
  getUserByAccountNumber,
  getUserByEmail,
  getUserById,
  updateUserBalance,
} from "../models/userModel";
import ApiError from "../middlewares/errorHandler";
import {
  AuthenticatedRequest,
  MetricsType,
  TransactionRequestBody,
  User,
} from "../types";
import { validateAmount } from "../utils/validator";
import transferEventEmitter from "../events/transferEvents";
import logger from "../config/logger";
import knex from "../utils/db";
import { generateStatementPDF } from "../utils/generateStatement";
import statementEventEmitter from "../events/statementEvents";
import {
  getUser,
  getRecipient,
  validateFunds,
  processTransaction,
  handleError,
} from "./transactionService";

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
      logger.warn(`User with ID ${userId} not found`);
      return next(new ApiError(404, "User not found"));
    }

    await validateAmount(amount, userId, next);
    if (res.headersSent) return;

    const amount_to_update = Number(user.balance) + Number(amount);

    await updateUserBalance(userId, amount_to_update, trx);
    transferEventEmitter.emit("fund", user, amount);

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
    logger.info(
      `[fundAccountController]: User with id ${userId} funded with ${amount} successfully`
    );

    res.status(201).json({
      message: "Account funded successfully",
      amount,
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
    const user = await getUser(userId, trx, next);
    if (!user) return;

    await validateAmount(amount, userId, next);
    console.log("recipient_email", recipient_email)


    const recipientData = await getRecipient(
      { recipient_id, recipient_account_number, recipient_email },
      user,
      trx,
      next
    );
    if (!recipientData) return;

    const { recipient, recipientIdentifier } = recipientData;

    if (!(await validateFunds(user, amount, trx, next))) return;

    if (await isDuplicateTransaction(userId, recipient.id, amount, type, trx)) {
      await trx.rollback();
      logger.warn(`Duplicate transaction detected for user with ID ${userId}`);
      return next(
        new ApiError(
          400,
          "Duplicate transaction: Please wait at least 30 seconds before repeating the same transaction"
        )
      );
    }

    const { senderTransactionId } = await processTransaction(
      user,
      recipient,
      amount,
      description,
      trx
    );

    const transaction = await getTransactionById(senderTransactionId);
    transferEventEmitter.emit("transferMade", user, recipient, amount);

    logger.info(`Transfer successful for user with ID ${userId}`);
    res.status(201).json({ message: "Transfer successful", transaction });
  } catch (error) {
    handleError(error, trx, userId, next);
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
  const { page, limit, fromDate, toDate } = req.query;

  // Set default dates to today's start and end if not provided
  const startOfToday = new Date();
  startOfToday.setHours(0, 0, 0, 0);

  const endOfToday = new Date();
  endOfToday.setHours(23, 59, 59, 999);

  const from = fromDate ? new Date(fromDate as string) : startOfToday;
  const to = toDate ? new Date(toDate as string) : endOfToday;

  try {
    const offset = page && limit ? (Number(page) - 1) * Number(limit) : 0;
    logger.info(`Fetching transaction history for user with ID ${userId}`);
    const transactions = await getPaginatedTransactionsByUserId(
      userId,
      limit ? Number(limit) : undefined,
      offset,
      from,
      to
    );

    const { initialBalance, finalBalance, totalDebit, totalCredit } =
      getTransactionMetrics(transactions);

    logger.info(
      `Transaction history retrieved successfully for user with ID ${userId}`
    );
    res.status(200).json({
      message: "Transaction history retrieved successfully",
      page,
      from,
      to,
      transactionCount: transactions.length,
      transactions,
      initialBalance,
      finalBalance,
      totalDebit,
      totalCredit,
    });
  } catch (error) {
    const err = error as Error;
    logger.error(
      `Error fetching transaction history for user with ID ${userId}: ${err.message}`
    );

    if (err.message.includes("Invalid date format")) {
      return next(new ApiError(400, err.message));
    }

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
    const transaction = await getTransactionById(Number(transactionId), userId);

    if (!transaction) {
      logger.warn(`Transaction with ID ${transactionId} not found`);
      return next(new ApiError(404, "Transaction not found"));
    }

    logger.info(
      `Transaction with ID ${transactionId} retrieved successfully for user with ID ${userId}`
    );
    res.status(200).json({
      message: "Transaction retrieved successfully",
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

// Controller to send statement of account as an email attachment
export const sendStatementController = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  logger.info(
    "transactionController.sendStatementController(): Function Entry"
  );

  const userId = req.user.id;
  const { fromDate, toDate } = req.query;

  // Set default dates to today's start and end if not provided
  const startOfToday = new Date();
  startOfToday.setHours(0, 0, 0, 0);

  const endOfToday = new Date();
  endOfToday.setHours(23, 59, 59, 999);

  const from = fromDate ? new Date(fromDate as string) : startOfToday;
  const to = toDate ? new Date(toDate as string) : endOfToday;

  try {
    // Check if user exists
    logger.info(
      `[sendStatementController]: Checking if user with ID ${userId} exists`
    );
    const user = await getUserById(userId);
    if (!user) {
      logger.warn(`User with ID ${userId} not found`);
      return next(new ApiError(404, "User not found"));
    }

    logger.info(`Fetching transaction history for user with ID ${userId}`);
    const transactions = await getPaginatedTransactionsByUserId(
      userId,
      undefined,
      0,
      from,
      to
    );

    const { initialBalance, finalBalance, totalDebit, totalCredit } =
      getTransactionMetrics(transactions);

    const currentDate = new Date().toISOString().split("T")[0];

    const metrics: MetricsType = {
      initialBalance,
      finalBalance,
      totalDebit,
      totalCredit,
      from: from.toISOString().split("T")[0],
      to: to.toISOString().split("T")[0],
      currentDate,
    };

    logger.info(`Generating statement for user with ID ${userId}`);
    // const filePath = await generateStatementCSV(transactions, userId);
    const filePath = await generateStatementPDF(transactions, user, metrics);

    logger.info(`Sending statement email to user with ID ${userId}`);
    // await sendStatementEmail(req.user.email, filePath);
    statementEventEmitter.emit("statement", user, from, to, filePath);

    res.status(200).json({
      message: "Statement sent successfully",
    });
  } catch (error) {
    const err = error as Error;
    logger.error(
      `Error sending statement for user with ID ${userId}: ${err.message}`
    );

    if (err.message.includes("Invalid date format")) {
      return next(new ApiError(400, err.message));
    }

    next(new ApiError(500, "Error sending statement"));
  } finally {
    logger.info(
      "transactionController.sendStatementController(): Function Exit"
    );
  }
};
