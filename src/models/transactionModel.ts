import knex from "../utils/db";
import { Transaction } from "../types";

// Function to create a new transaction
export const createTransaction = async (
  transaction: Partial<Transaction>
): Promise<number> => {
  const [transactionId] = await knex("transactions").insert(transaction);
  return transactionId;
};

// Function to get a transaction by ID
export const getTransactionById = async (id: number): Promise<Transaction> => {
  const transaction = await knex("transactions").where({ id }).first();
  return transaction;
};

// Function to get all transactions for a user
export const getTransactionsByUserId = async (
  userId: number
): Promise<Transaction[]> => {
  const transactions = await knex("transactions").where({ user_id: userId });
  return transactions;
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
