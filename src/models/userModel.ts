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
