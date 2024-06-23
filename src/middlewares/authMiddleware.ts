import { Response, NextFunction } from "express";
import axios from "axios";
import jwt from "jsonwebtoken";
import { getUserById } from "../models/userModel";
import ApiError from "./errorHandler";
import config from "../config/config";
import { AuthenticatedRequest } from "src/types";

export const checkBlacklist = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  const { email } = req.body;

  try {
    const response = await axios.get(`${config.adjutor.apiUrl}/${email}`, {
      headers: {
        Authorization: `Bearer ${config.adjutor.apiKey}`,
      },
    });

    if (response.status === 200 || response.status === 201) {
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
      return next();
    }
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
    return next(new ApiError(401, "Unauthorized Access"));
  }

  const token = authHeader.split(" ")[1];

  if (!token) {
    return next(new ApiError(401, "Token missing"));
  }

  try {
    const decoded: any = jwt.verify(token, config.jwtSecretKey);

    // Attach the user ID to the AuthenticatedRequest object
    // req.user.id = decoded.userId;

    // Optionally, retrieve and attach the user object to the AuthenticatedRequest
    const user = await getUserById(decoded.userId);

    if (!user) {
      return next(new ApiError(404, "User not found"));
    }

    req.user = user;
    next();
  } catch (error) {
    console.log("error in authenticate", error);
    return next(new ApiError(401, "Invalid or expired token"));
  }
};
