import express from "express";
import bodyParser from "body-parser";
import { errorHandler } from "./middlewares/errorHandler";
// import userRoutes from "./routes/userRoutes";
import authRoutes from "./routes/authRoutes";
import transactionRoutes from "./routes/transactionRoutes";

const app = express();

app.use(bodyParser.json());
// app.use("/api/v1/users", userRoutes);
app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/transactions", transactionRoutes);

// Global error handler
app.use(errorHandler);

export default app;
