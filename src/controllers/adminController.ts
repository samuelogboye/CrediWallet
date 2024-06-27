import { Response, NextFunction } from "express";
import { getUserById, updateUser } from "../models/userModel";
import ApiError from "../middlewares/errorHandler";
import { AuthenticatedRequest } from "../types";
import logger from "../config/logger";

// Controller to block a user
export const blockUserController = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  logger.info("adminController.blockUserController(): Function Entry");

  const { userId } = req.params;

  try {
    // Validate if userId is a number
    const numericUserId = Number(userId);
    if (isNaN(numericUserId)) {
      logger.warn(`Invalid userId provided: ${userId}`);
      return next(new ApiError(404, "Invalid user ID"));
    }

    // Check if the user exists
    const user = await getUserById(numericUserId);
    if (!user) {
      logger.warn(`User with ID ${numericUserId} not found`);
      return next(new ApiError(404, "User not found"));
    }

    // Block the user
    await updateUser(Number(userId), { is_blocked: true });
    await updateUser(numericUserId, { is_blocked: true });
    logger.info(`User with ID ${numericUserId} blocked successfully`);

    res.status(200).json({ message: "User blocked successfully" });
  } catch (error) {
    const err = error as Error;
    logger.error(`Error blocking user with ID ${userId}: ${err.message}`);
    next(new ApiError(500, "Error blocking user"));
  } finally {
    logger.info("adminController.blockUserController(): Function Exit");
  }
};

// Controller to unblock a user
export const unblockUserController = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  logger.info("adminController.unblockUserController(): Function Entry");

  const { userId } = req.params;

  try {
    // Validate if userId is a number
    const numericUserId = Number(userId);
    if (isNaN(numericUserId)) {
      logger.warn(`Invalid userId provided: ${userId}`);
      return next(new ApiError(404, "Invalid user ID"));
    }

    // Check if the user exists
    const user = await getUserById(numericUserId);
    if (!user) {
      logger.warn(`User with ID ${numericUserId} not found`);
      return next(new ApiError(404, "User not found"));
    }

    // Unblock the user
    await updateUser(Number(userId), { is_blocked: false });
    await updateUser(numericUserId, { is_blocked: false });
    logger.info(`User with ID ${numericUserId} unblocked successfully`);

    res.status(200).json({ message: "User unblocked successfully" });
  } catch (error) {
    const err = error as Error;
    logger.error(`Error unblocking user with ID ${userId}: ${err.message}`);
    next(new ApiError(500, "Error unblocking user"));
  } finally {
    logger.info("adminController.unblockUserController(): Function Exit");
  }
};

// Controller to make a user an admin
export const makeUserAdminController = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  logger.info("adminController.makeUserAdminController(): Function Entry");

  const { userId } = req.params;

  try {
    // Check if the user exists
    const user = await getUserById(Number(userId));
    if (!user) {
      logger.warn(`User with ID ${userId} not found`);
      return next(new ApiError(404, "User not found"));
    }

    // Make the user an admin
    await updateUser(Number(userId), { is_admin: true });
    logger.info(`User with ID ${userId} granted admin privileges`);

    res.status(200).json({ message: "User granted admin privileges" });
  } catch (error) {
    const err = error as Error;
    logger.error(
      `Error granting admin privileges to user with ID ${userId}: ${err.message}`
    );
    next(new ApiError(500, "Error granting admin privileges"));
  } finally {
    logger.info("adminController.makeUserAdminController(): Function Exit");
  }
};

// Controller to remove admin privileges from a user
export const removeAdminController = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  logger.info("adminController.removeAdminController(): Function Entry");

  const { userId } = req.params;

  try {
    // Check if the user exists
    const user = await getUserById(Number(userId));
    if (!user) {
      logger.warn(`User with ID ${userId} not found`);
      return next(new ApiError(404, "User not found"));
    }

    // Remove admin privileges
    await updateUser(Number(userId), { is_admin: false });
    logger.info(`Admin privileges removed from user with ID ${userId}`);

    res.status(200).json({ message: "Admin privileges removed from user" });
  } catch (error) {
    const err = error as Error;
    logger.error(
      `Error removing admin privileges from user with ID ${userId}: ${err.message}`
    );
    next(new ApiError(500, "Error removing admin privileges"));
  } finally {
    logger.info("adminController.removeAdminController(): Function Exit");
  }
};
