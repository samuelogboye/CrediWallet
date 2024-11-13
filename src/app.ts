import express, { Application, Request, Response, NextFunction } from "express";
import bodyParser from "body-parser";
import { errorHandler } from "./middlewares/errorHandler";
import userRoutes from "./routes/userRoutes";
import authRoutes from "./routes/authRoutes";
import transactionRoutes from "./routes/transactionRoutes";
import adminRoutes from "./routes/adminRoutes";
import "./events/transferEventHandler";
import "./events/userEventHandler";
import "./events/statementEventHandler";
import { requestLogger } from "./middlewares/logger";
import setupSwagger from "./middlewares/swagger";

const app: Application = express();

// Use the logger middleware
app.use(requestLogger);

setupSwagger(app);

app.use(bodyParser.json());
app.use("/api/v1/users", userRoutes);
app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/transactions", transactionRoutes);
app.use("/api/v1/admin", adminRoutes);

app.use("/", (req: Request, res: Response, next: NextFunction): void => {
  res.json({ message: "Welcome to CrediWallet App" });
});
// Global error handler
app.use(errorHandler);

export default app;
