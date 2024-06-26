import { Request, Response, NextFunction } from "express";
import {
  getUserById,
  updateUser,
  deleteUser,
  getAllUsers,
  getUserByAccountNumber,
} from "../models/userModel";
import ApiError from "../middlewares/errorHandler";
import { AuthenticatedRequest } from "../types";
import { allowedFields } from "src/models/userSchema";
import { validateUpdateFields } from "src/utils/validator";
import logger from "src/config/logger";

// Controller to get user details
export const getUserDetailsController = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  logger.info("userController.getUserDetailsController(): Function Entry");

  const userId = req.user.id;
  try {
    logger.info(`Fetching details for user with ID ${userId}`);
    const user = await getUserById(userId);
    if (!user) {
      logger.warn(`User with ID ${userId} not found`);
      return next(new ApiError(404, "User not found"));
    }

    logger.info(`User details fetched successfully for user with ID ${userId}`);
    res.status(200).json(user);
  } catch (error) {
    const err = error as Error;
    logger.error(
      `Error fetching user details for user with ID ${userId}: ${err.message}`
    );
    next(new ApiError(500, "Error fetching user details"));
  } finally {
    logger.info("userController.getUserDetailsController(): Function Exit");
  }
};

// Controller to update user details
export const updateUserDetailsController = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  logger.info("userController.updateUserDetailsController(): Function Entry");

  const userId = req.user.id;
  const updatedFields = req.body;

  try {
    logger.info(`Checking if user with ID ${userId} exists`);
    const user = await getUserById(userId);
    if (!user) {
      logger.warn(`User with ID ${userId} not found`);
      return next(new ApiError(404, "User not found"));
    }

    // Validate the fields
    logger.info(`Validating update fields for user with ID ${userId}`);
    const fields = Object.keys(updatedFields);
    const isValidOperation = fields.every((field) =>
      allowedFields.includes(field)
    );

    if (!isValidOperation) {
      const invalidFields = fields
        .filter((field) => !allowedFields.includes(field))
        .join(", ");
      logger.warn(
        `Invalid fields to update for user with ID ${userId}: ${invalidFields}`
      );
      return next(
        new ApiError(400, `Invalid fields to update: ${invalidFields}`)
      );
    }

    // Restricted fields that cannot be updated
    const restrictedFields = ["account_number", "email"];

    // Check for restricted fields
    validateUpdateFields(fields, restrictedFields, next);

    logger.info(`Updating user details for user with ID ${userId}`);
    await updateUser(userId, updatedFields);
    logger.info(`User details updated successfully for user with ID ${userId}`);
    res.status(200).json({ message: "User updated successfully" });
  } catch (error) {
    const err = error as Error;
    logger.error(
      `Error updating user details for user with ID ${userId}: ${err.message}`
    );
    next(new ApiError(500, "Error updating user details"));
  } finally {
    logger.info("userController.updateUserDetailsController(): Function Exit");
  }
};

// Controller to delete a user
export const deleteUserController = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  logger.info("userController.deleteUserController(): Function Entry");

  const userId = req.user.id;

  try {
    logger.info(`Checking if user with ID ${userId} exists`);
    const user = await getUserById(userId);
    if (!user) {
      logger.warn(`User with ID ${userId} not found`);
      return next(new ApiError(404, "User not found"));
    }

    logger.info(`Deleting user with ID ${userId}`);
    await deleteUser(userId);
    logger.info(`User deleted successfully with ID ${userId}`);
    res.status(200).json({ message: "User deleted successfully" });
  } catch (error) {
    const err = error as Error;
    logger.error(`Error deleting user with ID ${userId}: ${err.message}`);
    next(new ApiError(500, "Error deleting user"));
  } finally {
    logger.info("userController.deleteUserController(): Function Exit");
  }
};

// Controller to get all users
export const getAllUsersController = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  logger.info("userController.getAllUsersController(): Function Entry");

  try {
    logger.info("Fetching all users");
    const users = await getAllUsers();
    logger.info("All users fetched successfully");
    res.status(200).json(users);
  } catch (error) {
    const err = error as Error;
    logger.error(`Error fetching all users: ${err.message}`);
    next(new ApiError(500, "Error fetching users"));
  } finally {
    logger.info("userController.getAllUsersController(): Function Exit");
  }
};

// Controller to get users name with account number in params
export const getUserByAccountNumberController = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  logger.info(
    "userController.getUserByAccountNumberController(): Function Entry"
  );

  const { accountNumber } = req.params;
  try {
    logger.info(`Fetching user with account number ${accountNumber}`);
    const user = await getUserByAccountNumber(accountNumber);
    if (!user) {
      logger.warn(`User with account number ${accountNumber} not found`);
      return next(new ApiError(404, "User not found"));
    }
    logger.info(
      `User with account number ${accountNumber} fetched successfully`
    );
    res
      .status(200)
      .json({ name: user.name, accountNumber: user.account_number });
  } catch (error) {
    const err = error as Error;
    logger.error(
      `Error fetching user with account number ${accountNumber}: ${err.message}`
    );
    next(new ApiError(500, "Error fetching users"));
  } finally {
    logger.info(
      "userController.getUserByAccountNumberController(): Function Exit"
    );
  }
};
