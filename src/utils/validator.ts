import { Request, Response, NextFunction } from "express";
import Joi from "joi";
import {
  RegisterRequestBody,
  LoginRequestBody,
  TransactionRequestBody,
} from "../types";
import ApiError from "src/middlewares/errorHandler";

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
