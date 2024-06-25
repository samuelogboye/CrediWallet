import knex from "../utils/db";
import { Transaction } from "../types";

// Function to create a transaction
export const createTransaction = async (
  transaction: Partial<Transaction>
): Promise<number> => {
  const [id] = await knex("transactions").insert(transaction);
  return id;
};

// Function to get transactions by user ID
export const getTransactionsByUserId = async (
  userId: number
): Promise<Transaction[]> => {
  return await knex("transactions")
    .where({ user_id: userId })
    .orderBy("created_at", "desc");
};

// Function to get a transaction by ID
export const getTransactionById = async (
  transactionId: number
): Promise<Transaction | null> => {
  return await knex("transactions").where({ id: transactionId }).first();
};

// Function to get all transactions for a user with pagination
export const getPaginatedTransactionsByUserId = async (
  userId: number,
  limit: number,
  offset: number
): Promise<Transaction[]> => {
  const transactions = await knex("transactions")
    .where({ user_id: userId })
    .limit(limit)
    .offset(offset);
  return transactions;
};

// Function to check for duplicate transactions within 30 seconds
export const isDuplicateTransaction = async (
  userId: number,
  recipientId: number,
  money_out: number,
  type: string
): Promise<boolean> => {
  const lastTransaction = await knex("transactions")
    .where({ user_id: userId, recipient_id: recipientId, money_out, type })
    .orderBy("created_at", "desc")
    .first();

  if (lastTransaction) {
    const lastTransactionTime = new Date(lastTransaction.created_at).getTime();
    const currentTime = new Date().getTime();

    return currentTime - lastTransactionTime <= 30000; // 30 seconds in milliseconds
  }

  return false;
};
