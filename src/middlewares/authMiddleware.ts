import { Request, Response, NextFunction } from "express";
import axios from "axios";
import dotenv from "dotenv";

dotenv.config();

const ADJUTOR_API_URL = process.env.ADJUTOR_API_URL;

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
