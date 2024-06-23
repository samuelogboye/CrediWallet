import { Request, Response, NextFunction } from "express";
import { getUserById, updateUser } from "../models/userModel";
import ApiError from "../middlewares/errorHandler";
import { AuthenticatedRequest } from "../types";

// Controller to block a user
export const blockUserController = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  const { userId } = req.params;

  try {
    // Check if the user exists
    const user = await getUserById(Number(userId));
    if (!user) {
      return next(new ApiError(404, "User not found"));
    }

    // Block the user
    await updateUser(Number(userId), { is_blocked: true });
    res.status(200).json({ message: "User blocked successfully" });
  } catch (error) {
    next(new ApiError(500, "Error blocking user"));
  }
};

// Controller to unblock a user
export const unblockUserController = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  const { userId } = req.params;

  try {
    // Check if the user exists
    const user = await getUserById(Number(userId));
    if (!user) {
      return next(new ApiError(404, "User not found"));
    }

    // Unblock the user
    await updateUser(Number(userId), { is_blocked: false });
    res.status(200).json({ message: "User unblocked successfully" });
  } catch (error) {
    next(new ApiError(500, "Error unblocking user"));
  }
};

// Controller to make a user an admin
export const makeUserAdminController = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  const { userId } = req.params;

  try {
    // Check if the user exists
    const user = await getUserById(Number(userId));
    if (!user) {
      return next(new ApiError(404, "User not found"));
    }

    // Make the user an admin
    await updateUser(Number(userId), { is_admin: true });
    res.status(200).json({ message: "User granted admin privileges" });
  } catch (error) {
    next(new ApiError(500, "Error granting admin privileges"));
  }
};

// Controller to remove admin privileges from a user
export const removeAdminController = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  const { userId } = req.params;

  try {
    // Check if the user exists
    const user = await getUserById(Number(userId));
    if (!user) {
      return next(new ApiError(404, "User not found"));
    }

    // Remove admin privileges
    await updateUser(Number(userId), { is_admin: false });
    res.status(200).json({ message: "Admin privileges removed from user" });
  } catch (error) {
    next(new ApiError(500, "Error removing admin privileges"));
  }
};
