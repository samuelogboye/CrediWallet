import { Request, Response, NextFunction } from "express";
import logger from "../config/logger";

const requestLogger = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  logger.info(`${req.method} ${req.url} ${req.headers.origin}`);
  next();
};

export { requestLogger };
