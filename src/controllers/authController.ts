import { Request, Response, NextFunction } from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import knex from "../utils/db";
import ApiError from "../middlewares/errorHandler";

import { AuthBody, AuthenticatedRequest, User } from "../types";
import {
  createUser,
  generateAccountNumber,
  getUserByEmail,
} from "src/models/userModel";

const SECRET_KEY = process.env.SECRET_KEY;

// Register a new user
export const registerController = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  const { name, email, password } = req.body as AuthBody;

  try {
    // Check if the user already exists
    const existingUser = await getUserByEmail(email);
    if (existingUser) {
      return next(new ApiError(400, "User already exists"));
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Generate a unique account number
    const accountNumber = await generateAccountNumber();

    // Create the user
    const userId = await createUser({
      name,
      email,
      password: hashedPassword,
      account_number: accountNumber,
    });

    // Generate a JWT token
    const token = jwt.sign({ userId, email }, SECRET_KEY, { expiresIn: "1h" });

    res
      .status(201)
      .json({
        message: "User registered successfully",
        token,
        UserData: { name, email, accountNumber },
      });
  } catch (error) {
    next(new ApiError(500, `Error registering user`));
  }
};

// Log in an existing user
export const loginController = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { email, password } = req.body as AuthBody;

  try {
    const user = await getUserByEmail(email);

    if (!user) {
      return next(new ApiError(404, "User not found"));
    }

    const isValidPassword = await bcrypt.compare(password, user.password);

    if (!isValidPassword) {
      return next(new ApiError(401, "Invalid credentials"));
    }

    const token = jwt.sign({ userId: user.id, email: user.email }, SECRET_KEY, {
      expiresIn: "1h",
    });

    res.status(200).json({ message: "Login successful", token });
  } catch (error) {
    return next(new ApiError(500, "Error logging in user"));
  }
};
