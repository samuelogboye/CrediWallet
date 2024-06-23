import knex from "../utils/db";
import { User } from "../types";

// Function to create a new user
export const createUser = async (user: Partial<User>): Promise<number> => {
  const [userId] = await knex("users").insert(user);
  return userId;
};

// Function to get a user by ID
export const getUserById = async (id: number): Promise<User> => {
  const user = await knex("users").where({ id }).first();
  return user;
};

// Function to get a user by email
export const getUserByEmail = async (email: string): Promise<User> => {
  const user = await knex("users").where({ email }).first();
  return user;
};

// Function to update a user's balance
export const updateUserBalance = async (
  id: number,
  newBalance: number
): Promise<void> => {
  await knex("users").where({ id }).update({ balance: newBalance });
};

// Function to update a user record
export const updateUser = async (
  id: number,
  updatedFields: Partial<User>
): Promise<void> => {
  await knex("users").where({ id }).update(updatedFields);
};

// Function to delete a user record
export const deleteUser = async (id: number): Promise<void> => {
  await knex("users").where({ id }).del();
};

// Function to get all users
export const getAllUsers = async (): Promise<User[]> => {
  return await knex("users");
};

// Function to get a user by account number
export const getUserByAccountNumber = async (
  accountNumber: string
): Promise<User | undefined> => {
  return await knex("users").where({ account_number: accountNumber }).first();
};

// Function to generate a unique account number
export const generateAccountNumber = async (): Promise<string> => {
  let accountNumber;
  let userWithAccountNumber;

  do {
    /// Generate a random 9-digit number and prepend '1' to make it a 10-digit number
    const randomNineDigitNumber = Math.floor(
      Math.random() * 900000000 + 100000000
    );
    accountNumber = `1${randomNineDigitNumber}`;
    userWithAccountNumber = await getUserByAccountNumber(accountNumber);
  } while (userWithAccountNumber);

  return accountNumber;
};
