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

// Controller to get user details
export const getUserDetailsController = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  const userId = req.user.id;
  try {
    const user = await getUserById(userId);
    if (!user) {
      return next(new ApiError(404, "User not found"));
    }

    res.status(200).json(user);
  } catch (error) {
    next(new ApiError(500, "Error fetching user details"));
  }
};

// Controller to update user details
export const updateUserDetailsController = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  const userId = req.user.id;
  const updatedFields = req.body;

  try {
    // Check if user exists
    const user = await getUserById(userId);
    if (!user) {
      return next(new ApiError(404, "User not found"));
    }

    // Validate the fields
    const fields = Object.keys(updatedFields);
    const isValidOperation = fields.every((field) =>
      allowedFields.includes(field)
    );

    if (!isValidOperation) {
      const invalidFields = fields
        .filter((field) => !allowedFields.includes(field))
        .join(", ");
      return next(
        new ApiError(400, `Invalid fields to update: ${invalidFields}`)
      );
    }
    // Restricted fields that cannot be updated
    const restrictedFields = ["account_number", "email"];

    // Check for restricted fields
    validateUpdateFields(fields, restrictedFields, next);

    await updateUser(userId, updatedFields);
    res.status(200).json({ message: "User updated successfully" });
  } catch (error) {
    console.log("errir", error);
    next(new ApiError(500, "Error updating user details"));
  }
};

// Controller to delete a user
export const deleteUserController = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  const userId = req.user.id;

  try {
    const user = await getUserById(userId);
    if (!user) {
      return next(new ApiError(404, "User not found"));
    }

    await deleteUser(userId);
    res.status(200).json({ message: "User deleted successfully" });
  } catch (error) {
    next(new ApiError(500, "Error deleting user"));
  }
};

// Controller to get all users
export const getAllUsersController = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const users = await getAllUsers();
    res.status(200).json(users);
  } catch (error) {
    next(new ApiError(500, "Error fetching users"));
  }
};

// Controller to get users name with account number in params
export const getUserByAccountNumberontroller = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { accountNumber } = req.params;
  try {
    const users = await getUserByAccountNumber(accountNumber);
    if (!users) {
      return next(new ApiError(404, "User not found"));
    }
    res
      .status(200)
      .json({ name: users.name, accountNumber: users.account_number });
  } catch (error) {
    console.log("err", error);
    next(new ApiError(500, "Error fetching users"));
  }
};
