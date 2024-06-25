import { Request, Response, NextFunction } from "express";
import {
  createTransaction,
  getTransactionsByUserId,
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
import { logEvents } from "src/middlewares/logEvents";

// // Controller to create a new transaction
// // Controller to create a new transaction
// export const createTransactionController = async (
//   req: AuthenticatedRequest,
//   res: Response,
//   next: NextFunction
// ) => {
//   const {
//     type,
//     amount,
//     recipient_id,
//     recipient_account_number,
//     recipient_email,
//   } = req.body;
//   const userId = req.user.id; // Assuming user ID is attached to req.user by an authentication middleware

//   try {
//     // Check if user exists
//     const user = await getUserById(userId);
//     if (!user) {
//       return next(new ApiError(404, "User not found"));
//     }

//     let recipient;

//     // Determine the recipient based on the provided fields
//     if (recipient_id) {
//       recipient = await getUserById(recipient_id);
//       if (recipient && recipient.id === user.id) {
//         return next(new ApiError(400, "Cannot create transaction with self"));
//       }
//     } else if (recipient_account_number) {
//       recipient = await getUserByAccountNumber(recipient_account_number);
//       if (recipient && recipient.account_number === user.account_number) {
//         return next(new ApiError(400, "Cannot create transaction with self"));
//       }
//     } else if (recipient_email) {
//       recipient = await getUserByEmail(recipient_email, false);
//       if (recipient && recipient.email === user.email) {
//         return next(new ApiError(400, "Cannot create transaction with self"));
//       }
//     }

//     if (!recipient) {
//       return next(
//         new ApiError(404, "Recipient not found or incorrect, Please check")
//       );
//     }

//     // Perform transaction based on type
//     switch (type) {
//       case "fund":
//         await updateUserBalance(userId, user.balance + amount);
//         break;
//       case "withdraw":
//         if (user.balance < amount) {
//           return next(new ApiError(400, "Insufficient funds"));
//         }
//         await updateUserBalance(userId, user.balance - amount);
//         break;
//       case "transfer":
//         if (user.balance < amount) {
//           return next(new ApiError(400, "Insufficient funds"));
//         }
//         await updateUserBalance(userId, user.balance - amount);
//         await updateUserBalance(recipient.id, recipient.balance + amount);
//         break;
//       default:
//         return next(new ApiError(400, "Invalid transaction type"));
//     }

//     // Create transaction record
//     const transactionId = await createTransaction({
//       user_id: userId,
//       type,
//       amount,
//       recipient_id: recipient ? recipient.id : null,
//     });

//     res.status(201).json({ message: "Transaction successful", transactionId });
//   } catch (error) {
//     next(new ApiError(500, "Error processing transaction"));
//   }
// };

// Controller to fund an account
export const fundAccountController = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  const { amount } = req.body as TransactionRequestBody;
  const userId = req.user.id;

  try {
    // Check if user exists
    const user = await getUserById(userId);
    if (!user) {
      return next(new ApiError(404, "User not found"));
    }

    // Fund account
    await updateUserBalance(userId, user.balance + amount);

    // Create transaction record
    const transactionId = 3;
    // const transactionId = await createTransaction({
    //   user_id: userId,
    //   type: "fund",
    //   amount,
    // });

    res
      .status(201)
      .json({ message: "Account funded successfully", transactionId });
  } catch (error) {
    next(new ApiError(500, "Error funding account"));
  }
};

// Controller to transfer funds
export const transferController = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  const {
    type,
    amount,
    recipient_id,
    recipient_account_number,
    recipient_email,
    description,
  } = req.body as TransactionRequestBody;
  const userId = req.user.id;

  try {
    // Check if user exists
    const user = await getUserById(userId);
    if (!user) {
      return next(new ApiError(404, "User not found"));
    }

    // if amount is a negative value throw error and log a trigger alert with the senders user id
    if (amount < 0) {
      await logEvents("Negative amount detected", "eventLog.txt");
      return next(new ApiError(400, "Invalid amount"));
    }

    let recipient: Partial<User>;
    let recipientIdentifier;

    // Determine the recipient based on the provided fields
    if (recipient_id) {
      recipient = await getUserById(recipient_id);
      recipientIdentifier = { recipient_id };
      if (recipient && recipient.id === user.id) {
        return next(new ApiError(400, "Cannot create transaction with self"));
      }
    } else if (recipient_account_number) {
      recipient = await getUserByAccountNumber(recipient_account_number);
      recipientIdentifier = { recipient_account_number };
      if (recipient && recipient.account_number === user.account_number) {
        return next(new ApiError(400, "Cannot create transaction with self"));
      }
    } else if (recipient_email) {
      recipient = await getUserByEmail(recipient_email, false);
      recipientIdentifier = { recipient_email };
      if (recipient && recipient.email === user.email) {
        return next(new ApiError(400, "Cannot create transaction with self"));
      }
    }

    if (!recipient) {
      return next(new ApiError(404, "Recipient not found"));
    }

    // Check for sufficient funds
    if (user.balance < amount) {
      return next(new ApiError(400, "Insufficient funds"));
    }

    // Check for duplicate transactions within 30 seconds
    const isDuplicate = await isDuplicateTransaction(
      userId,
      recipient.id,
      amount,
      type
    );
    if (isDuplicate) {
      return next(
        new ApiError(
          400,
          "Duplicate transaction: Please wait at least 30 seconds before repeating the same transaction"
        )
      );
    }
    // Perform transfer
    const senderBalance = user.balance - amount;
    const recipientBalance = Number(recipient.balance) + amount;

    await updateUserBalance(userId, senderBalance);
    await updateUserBalance(recipient.id, recipientBalance);

    // Create transaction record for the sender
    const senderTransactionId = await createTransaction({
      type: "transfer",
      user_id: userId,
      money_out: amount,
      money_in: 0,
      recipient_to_from: recipient.name + "/" + recipient.account_number,
      description: description ? description : "Transfer to " + recipient.name,
      balance: senderBalance,
      recipient_id: recipient.id,
    });

    // Create transaction record for the sender
    const recipientTransactionId = await createTransaction({
      type: "fund",
      user_id: recipient.id,
      money_out: 0,
      money_in: amount,
      recipient_to_from: user.name + "/" + user.account_number,
      description: description ? description : "Fund from " + user.name,
      balance: recipientBalance,
      recipient_id: userId,
    });

    const transaction = await getTransactionById(senderTransactionId);

    res.status(201).json({
      message: "Transfer successful",
      transaction,
    });
  } catch (error) {
    console.log("err", error);
    next(new ApiError(500, "Error processing transfer"));
  }
};

// Controller to withdraw funds
export const withdrawController = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  const { amount } = req.body as TransactionRequestBody;
  const userId = req.user.id;

  try {
    // Check if user exists
    const user = await getUserById(userId);
    if (!user) {
      return next(new ApiError(404, "User not found"));
    }

    // Check for sufficient funds
    if (user.balance < amount) {
      return next(new ApiError(400, "Insufficient funds"));
    }

    // Withdraw funds
    await updateUserBalance(userId, user.balance - amount);

    // Create transaction record
    const transactionId = 3;
    // const transactionId = await createTransaction({
    //   user_id: userId,
    //   type: "withdraw",
    //   amount,
    // });

    res.status(201).json({ message: "Withdrawal successful", transactionId });
  } catch (error) {
    next(new ApiError(500, "Error processing withdrawal"));
  }
};

// Controller to get transaction history for a user
export const getTransactionHistory = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  const userId = req.user.id;
  const { page = 1, limit = 10 } = req.query;

  try {
    const offset = (Number(page) - 1) * Number(limit);
    const transactions = await getPaginatedTransactionsByUserId(
      userId,
      Number(limit),
      offset
    );

    res.status(200).json({
      message: "Transaction history retrieved successfully",
      userData: req.user,
      transactionCount: transactions.length,
      transactions,
    });
  } catch (error) {
    next(new ApiError(500, "Error fetching transaction history"));
  }
};
