import dotenv from "dotenv";
import { Config } from "./../types";

// Load environment variables from .env file
dotenv.config();

const config: Config = {
  db: {
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    port: Number(process.env.DB_PORT),
  },
  prodDb: {
    host: process.env.PROD_DB_HOST,
    user: process.env.PROD_DB_USER,
    password: process.env.PROD_DB_PASSWORD,
    database: process.env.PROD_DB_NAME,
    port: Number(process.env.PROD_DB_PORT),
  },
  jwtSecretKey: process.env.SECRET_KEY,
  adjutor: {
    apiUrl: process.env.ADJUTOR_API_URL,
    apiKey: process.env.ADJUTOR_API_KEY,
  },
  serverPort: Number(process.env.PORT),
  secretKey: process.env.SECRET_KEY,
  environment: process.env.NODE_ENV,
  loglyToken: process.env.LOGLY_TOKEN,
};

export default config;
