import { Request, Response, NextFunction } from "express";
import axios from "axios";
import jwt from "jsonwebtoken";
import { getUserById } from "../models/userModel";
import ApiError from "./errorHandler";
import config from "../config/config";
import { User, AuthenticatedRequest } from "../types";

const ADJUTOR_API_URL = config.adjutorApiUrl;

export const checkBlacklist = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { email } = req.body;

  try {
    const response = await axios.post(ADJUTOR_API_URL, { email });

    if (response.data.isBlacklisted) {
      return res.status(403).json({ message: "User is blacklisted" });
    }

    next();
  } catch (error) {
    res.status(500).json({ message: "Error checking blacklist", error });
  }
};

export const authenticate = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  const authHeader = req.headers["authorization"];

  if (!authHeader) {
    return next(new ApiError(401, "Authorization header missing"));
  }

  const token = authHeader.split(" ")[1];

  if (!token) {
    return next(new ApiError(401, "Token missing"));
  }

  try {
    const decoded: any = jwt.verify(token, config.jwtSecretKey);

    // Attach the user ID to the request object
    req.userId = decoded.userId;

    // Optionally, retrieve and attach the user object to the request
    const user = await getUserById(decoded.userId);

    if (!user) {
      return next(new ApiError(404, "User not found"));
    }

    req.user = user;
    next();
  } catch (error) {
    return next(new ApiError(401, "Invalid or expired token"));
  }
};
