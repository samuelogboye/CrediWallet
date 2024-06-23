import { Request, Response, NextFunction } from "express";
import {
  getUserById,
  updateUser,
  deleteUser,
  getAllUsers,
} from "../models/userModel";
import ApiError from "../middlewares/errorHandler";
import { AuthenticatedRequest } from "../types";
import { allowedFields } from "src/models/userSchema";

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
    // Validate the fields
    const fields = Object.keys(updatedFields);
    const isValidOperation = fields.every((field) =>
      allowedFields.includes(field)
    );

    if (!isValidOperation) {
      return next(
        new ApiError(
          400,
          `Invalid fields to update: ${fields
            .filter((field) => !allowedFields.includes(field))
            .join(", ")}`
        )
      );
    }

    const user = await getUserById(userId);
    if (!user) {
      return next(new ApiError(404, "User not found"));
    }

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
