import { Response, NextFunction } from "express";
import axios from "axios";
import jwt from "jsonwebtoken";
import { getUserById } from "../models/userModel";
import ApiError from "./errorHandler";
import config from "../config/config";
import { AuthenticatedRequest, SafeUser } from "src/types";
import logger from "src/config/logger";
import { decodeToken } from "src/utils/jwtUtils";

export const checkBlacklist = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  logger.info("authMiddleware.checkBlacklist(): Function Entry");

  const { email } = req.body;
  logger.info(`Checking blacklist status for email: ${email}`);

  try {
    const response = await axios.get(`${config.adjutor.apiUrl}/${email}`, {
      headers: {
        Authorization: `Bearer ${config.adjutor.apiKey}`,
      },
    });

    if (response.status === 200 || response.status === 201) {
      logger.warn(`Email ${email} is blacklisted`);
      return res.status(403).json({
        message:
          "You cannot register an account with us currently. Please contact support.",
      });
    }
    next();
  } catch (error: any) {
    if (
      error.response &&
      error.response.status === 404 &&
      error.response.data.message === "Identity not found in karma"
    ) {
      logger.info(`Email ${email} is not blacklisted`);
      return next();
    }
    logger.error(
      `Error checking blacklist for email ${email}: ${error.message}`
    );
    res.status(500).json({ message: "Error checking blacklist", error });
  } finally {
    logger.info("authMiddleware.checkBlacklist(): Function Exit");
  }
};

export const authenticate = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  logger.info("authMiddleware.authenticate(): Function Entry");

  const authHeader = req.headers["authorization"];
  if (!authHeader) {
    logger.warn("Authorization header missing");
    return next(new ApiError(401, "Unauthorized Access"));
  }

  const token = authHeader.split(" ")[1];
  if (!token) {
    logger.warn("Token missing in authorization header");
    return next(new ApiError(401, "Token missing"));
  }

  try {
    const decoded = decodeToken(token);
    logger.info(`Token verified, decoding user ID: ${decoded.userId}`);

    const user = await getUserById(decoded.userId);
    if (!user) {
      logger.warn(`User with ID ${decoded.userId} not found`);
      return next(new ApiError(404, "User not found"));
    }

    // Omit the password field
    const { password, ...safeUser } = user;
    req.user = safeUser as SafeUser;

    logger.info(`User with ID ${decoded.userId} authenticated successfully`);
    next();
  } catch (error) {
    const err = error as Error;
    logger.error(`Error during authentication: ${err.message}`);
    return next(new ApiError(401, "Invalid or expired token"));
  } finally {
    logger.info("authMiddleware.authenticate(): Function Exit");
  }
};
