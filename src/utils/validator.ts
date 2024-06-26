import { Request, Response, NextFunction } from "express";
import Joi from "joi";
import {
  RegisterRequestBody,
  LoginRequestBody,
  TransactionRequestBody,
} from "../types";
import ApiError from "src/middlewares/errorHandler";
import { logEvents } from "src/middlewares/logEvents";

export const validateRegister = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const schema = Joi.object<RegisterRequestBody>({
    name: Joi.string().min(3).max(30).required(),
    email: Joi.string().email().required(),
    password: Joi.string().min(6).max(30).required(),
  });

  const { error } = schema.validate(req.body);
  if (error) {
    return res.status(400).json({ error: error.details[0].message });
  }
  next();
};

export const validateLogin = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const schema = Joi.object<LoginRequestBody>({
    email: Joi.string().email().required(),
    password: Joi.string().min(6).max(30).required(),
  });

  const { error } = schema.validate(req.body);
  if (error) {
    return res.status(400).json({ error: error.details[0].message });
  }
  next();
};

export const validateTransaction = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const schema = Joi.object<TransactionRequestBody>({
    type: Joi.string().valid("fund", "transfer", "withdraw").required(),
    amount: Joi.number().positive().required(),
    recipient_id: Joi.number().optional(),
  });

  const { error } = schema.validate(req.body);
  if (error) {
    return res.status(400).json({ error: error.details[0].message });
  }
  next();
};

export const validateUpdateFields = (
  fields: string[],
  restrictedFields: string[],
  next: NextFunction
) => {
  const restricted = fields.filter((field) => restrictedFields.includes(field));
  if (restricted.length > 0) {
    const errorFields = restricted.join(", ");
    return next(
      new ApiError(
        400,
        `Field(s) ${errorFields} cannot be changed, contact admin`
      )
    );
  }
};

export const validateAmount = async (
  amount: number,
  userId: number,
  next: NextFunction
): Promise<void> => {
  if (typeof amount !== "number" || isNaN(amount)) {
    await logEvents(
      `Invalid amount detected for user ID: ${userId}`,
      "eventLog.txt"
    );
    return next(new ApiError(400, "Amount must be a number"));
  }

  if (amount <= 0) {
    await logEvents(
      `Non-positive amount detected for user ID: ${userId}`,
      "eventLog.txt"
    );
    return next(new ApiError(400, "Amount must be greater than zero"));
  }

  const minimumAmount = 1; // Define a minimum amount if necessary
  if (amount < minimumAmount) {
    await logEvents(
      `Amount below minimum threshold detected for user ID: ${userId}`,
      "eventLog.txt"
    );
    return next(new ApiError(400, `Amount must be at least ${minimumAmount}`));
  }

  const maximumAmount = 10000; // Define a maximum amount if necessary
  if (amount > maximumAmount) {
    await logEvents(
      `Amount above maximum threshold detected for user ID: ${userId}`,
      "eventLog.txt"
    );
    return next(new ApiError(400, `Amount must not exceed ${maximumAmount}`));
  }

  const decimalPlaces = (amount.toString().split(".")[1] || "").length;
  if (decimalPlaces > 2) {
    await logEvents(
      `Amount with excessive decimal places detected for user ID: ${userId}`,
      "eventLog.txt"
    );
    return next(
      new ApiError(400, "Amount must not have more than two decimal places")
    );
  }
};
