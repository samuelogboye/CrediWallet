import { Request, Response, NextFunction } from "express";
import ApiError from "./errorHandler";
import { AuthenticatedRequest } from "../types";

export const validateAdmin = (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  if (!req.user || !req.user.is_admin) {
    return next(new ApiError(403, "Admin access required"));
  }
  next();
};
