import { Request, Response, NextFunction } from "express";
import bcrypt from "bcrypt";
import ApiError from "../middlewares/errorHandler";
import { AuthBody, AuthenticatedRequest } from "../types";
import {
  createUser,
  generateAccountNumber,
  getUserByEmail,
} from "../models/userModel";
import userEventEmitter from "../events/userEvents";
import logger from "../config/logger";
import { signToken } from "../utils/jwtUtils";

// Register a new user
export const registerController = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  logger.info("authController.registerController(): Function Entry");

  const { name, email, password } = req.body as AuthBody;

  try {
    // Check if the user already exists
    const existingUser = await getUserByEmail(email);
    if (existingUser) {
      logger.warn(
        `Registration attempt failed: User with email ${email} already exists`
      );
      return next(new ApiError(400, "User already exists"));
    }

    // Hash the password
    logger.info("Hashing user password");
    const hashedPassword = await bcrypt.hash(password, 10);

    // Generate a unique account number
    logger.info("Generating unique account number");
    const accountNumber = await generateAccountNumber();

    // Create the user
    logger.info("Creating user in the database");
    const userId = await createUser({
      name,
      email,
      password: hashedPassword,
      account_number: accountNumber,
    });

    // Generate a JWT token
    logger.info("Generating JWT token");
    const token = signToken({ userId });

    // Emit registration event
    logger.info("Emitting userRegistered event");
    userEventEmitter.emit("userRegistered", { name, email });

    logger.info(`User with id ${userId} registered successfully`);

    res.status(201).json({
      message: "User registered successfully",
      token,
      UserData: { name, email, accountNumber },
    });
  } catch (error) {
    const err = error as Error;
    logger.error(`Error registering user: ${err.message}`);
    next(new ApiError(500, `Error registering user`));
  } finally {
    logger.info("authController.registerController(): Function Exit");
  }
};

// Log in an existing user
export const loginController = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  logger.info("authController.loginController(): Function Entry");

  const { email, password } = req.body as AuthBody;

  try {
    // Check if the user exists
    logger.info(`Checking if user with email ${email} exists`);
    const user = await getUserByEmail(email, true);

    if (!user) {
      logger.warn(`Login attempt failed: User with email ${email} not found`);
      return next(new ApiError(404, "User not found"));
    }

    // Verify the password
    logger.info("Verifying user password");
    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      logger.warn(
        `Login attempt failed: Invalid password for user with email ${email}`
      );
      return next(new ApiError(401, "Invalid credentials"));
    }

    // Generate a JWT token
    logger.info("Generating JWT token");
    const token = signToken({ userId: user.id });

    // Gather login details
    const time = new Date().toLocaleString();
    const location = "Unknown"; // You may use a geolocation service to get the actual location
    const userAgent = req.get("User-Agent") || "Unknown";
    const ip = req.ip;
    const browser = req.get("User-Agent") || "Unknown"; // Simplified. Use a library like `useragent` for detailed browser info.

    // Emit login event
    logger.info("Emitting userLoggedIn event");
    userEventEmitter.emit("userLoggedIn", {
      name: user.name,
      email: user.email,
      time,
      location,
      userAgent,
      ip,
      browser,
    });

    logger.info(`User with id ${user.id} logged in successfully`);

    res.status(200).json({ message: "Login successful", token });
  } catch (error) {
    const err = error as Error;
    logger.error(`Error logging in user: ${err.message}`);
    return next(new ApiError(500, "Error logging in user"));
  } finally {
    logger.info("authController.loginController(): Function Exit");
  }
};
