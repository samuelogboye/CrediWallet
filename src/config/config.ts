import dotenv from "dotenv";
import { Config } from "./../types";

// Load environment variables from .env file
dotenv.config();

const config: Config = {
  db: {
    host: process.env.DB_HOST || "localhost",
    user: process.env.DB_USER || "root",
    password: process.env.DB_PASSWORD || "",
    database: process.env.DB_NAME || "wallet_service",
    port: Number(process.env.DB_PORT) || 3306,
  },
  jwtSecretKey: process.env.SECRET_KEY || "your_jwt_secret_key",
  adjutorApiUrl:
    process.env.ADJUTOR_API_URL || "https://api.adjutor.com/karma-blacklist",
  serverPort: Number(process.env.PORT) || 3000,
};

export default config;
