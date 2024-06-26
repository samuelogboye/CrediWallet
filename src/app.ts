import express from "express";
import bodyParser from "body-parser";
import cors from "cors";
import { errorHandler } from "./middlewares/errorHandler";
import userRoutes from "./routes/userRoutes";
import authRoutes from "./routes/authRoutes";
import transactionRoutes from "./routes/transactionRoutes";
import adminRoutes from "./routes/adminRoutes";
import "./events/transferHandler";
import "./events/userEventHandler";
import { requestLogger } from "./middlewares/logger";

const app = express();

// Use the logger middleware
app.use(requestLogger);

// Cross Origin Resource Sharing
// app.use(cors(corsOptions));

app.use(bodyParser.json());
app.use("/api/v1/users", userRoutes);
app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/transactions", transactionRoutes);
app.use("/api/v1/admin", adminRoutes);

// Global error handler
app.use(errorHandler);

export default app;
