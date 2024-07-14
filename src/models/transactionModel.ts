import knex from "../utils/db";
import { Transaction as TransactionType } from "../types";
import { Knex } from "knex";

// Function to create a transaction
export const createTransaction = async (
  transaction: Partial<TransactionType>,
  trx: Knex.Transaction
): Promise<number> => {
  try {
    const [id] = await trx("transactions").insert(transaction);
    return id;
  } catch (error) {
    const err = error as Error;
    console.error(`Error creating transaction: ${err.message}`);
    throw new Error("Error creating transaction");
  }
};

// Function to get transactions by user ID
export const getTransactionsByUserId = async (
  userId: number
): Promise<TransactionType[]> => {
  try {
    return await knex("transactions")
      .where({ user_id: userId })
      .orderBy("created_at", "desc");
  } catch (error) {
    const err = error as Error;
    console.error(
      `Error fetching transactions for user ID ${userId}: ${err.message}`
    );
    throw new Error("Error fetching transactions");
  }
};

// Function to get a transaction by ID
export const getTransactionById = async (
  transactionId: number,
  trx?: Knex.Transaction
): Promise<TransactionType | null> => {
  try {
    const query = trx ? trx("transactions") : knex("transactions");
    return await query.where({ id: transactionId }).first();
  } catch (error) {
    const err = error as Error;
    console.error(
      `Error fetching transaction by ID ${transactionId}: ${err.message}`
    );
    throw new Error("Error fetching transaction");
  }
};

// Function to get all transactions for a user with pagination
export const getPaginatedTransactionsByUserId = async (
  userId: number,
  limit: number,
  offset: number
): Promise<TransactionType[]> => {
  try {
    return await knex("transactions")
      .where({ user_id: userId })
      .limit(limit)
      .offset(offset);
  } catch (error) {
    const err = error as Error;
    console.error(
      `Error fetching paginated transactions for user ID ${userId}: ${err.message}`
    );
    throw new Error("Error fetching paginated transactions");
  }
};

// Function to check for duplicate transactions within 30 seconds
export const isDuplicateTransaction = async (
  userId: number,
  recipientId: number,
  money_out: number,
  type: string,
  trx: Knex.Transaction
): Promise<boolean> => {
  try {
    const lastTransaction = await trx("transactions")
      .where({ user_id: userId, recipient_id: recipientId, money_out, type })
      .orderBy("created_at", "desc")
      .first();

    if (lastTransaction) {
      const lastTransactionTime = new Date(
        lastTransaction.created_at
      ).getTime();
      const currentTime = new Date().getTime();
      return currentTime - lastTransactionTime <= 30000; // 30 seconds in milliseconds
    }

    return false;
  } catch (error) {
    const err = error as Error;
    console.error(`Error checking for duplicate transaction: ${err.message}`);
    throw new Error("Error checking for duplicate transaction");
  }
};
