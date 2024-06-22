// types/index.d.ts
import { Request } from "express";

// The User type
export interface User {
  id: number;
  name: string;
  email: string;
  password: string;
  balance: number;
  created_at: Date;
}

// The Transaction type
export interface Transaction {
  id: number;
  user_id: number;
  type: "fund" | "transfer" | "withdraw";
  amount: number;
  recipient_id?: number;
  created_at: Date;
}

// A type for the response of the Lendsqr Adjutor Karma blacklist API
export interface BlacklistResponse {
  isBlacklisted: boolean;
}

// A type for the request body when registering a user
export interface RegisterRequestBody {
  name: string;
  email: string;
  password: string;
}

// A type for the request body when logging in a user
export interface LoginRequestBody {
  email: string;
  password: string;
}

// A type for the request body when performing a transaction
export interface TransactionRequestBody {
  type: "fund" | "transfer" | "withdraw";
  amount: number;
  recipient_id?: number;
}

// A type for the request body when verifying a user's email
export interface VerifyEmailRequestBody {
  email: string;
}

export interface AuthenticatedRequest extends Request {
  user?: User;
  userId?: number; // Add userId to the request interface
}

export interface Config {
  db: {
    host: string;
    user: string;
    password: string;
    database: string;
    port: number;
  };
  jwtSecretKey: string;
  adjutorApiUrl: string;
  serverPort: number;
}
