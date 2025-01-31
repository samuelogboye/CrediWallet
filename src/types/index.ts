// types/index.d.ts
import { Request, Response, NextFunction } from "express";

// Add a type for transaction types to avoid repetition
export type TransactionType = "fund" | "transfer" | "withdraw";

// Improved User interface
export interface User {
  id: number;
  name: string;
  email: string; // Make email required since it's used for login
  password: string; // Make password required for security
  account_number: string | null; // Better than optional
  balance: number; // Should be required, default to 0
  is_admin: boolean; // Default values are better than optional
  is_blocked: boolean;
  is_email_confirmed: boolean;
  created_at: Date;
  updated_at: Date;
}

// Improved Transaction interface
export interface Transaction {
  id: number;
  user_id: number;
  type: TransactionType; // Use the new type
  money_out: number;
  money_in: number;
  description: string;
  recipient_to_from: string;
  balance: number;
  recipient_id: number | null; // Better than optional
  created_at: Date;
}

// Remove AuthBody as it's duplicate of RegisterRequestBody

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

// Improved TransactionRequestBody
export interface TransactionRequestBody {
  type: TransactionType; // Use the new type
  amount: number;
  recipient_id?: number;
  recipient_account_number?: string;
  recipient_email?: string;
  description: string; // Make required for better tracking
}

// A type for the request body when verifying a user's email
export interface VerifyEmailRequestBody {
  email: string;
}

export interface DbConfig {
  host: string;
  user: string;
  password: string;
  database: string;
  port: number;
}

export interface Config {
  db: DbConfig;
  prodDb: DbConfig;
  adjutor: {
    apiUrl: string;
    apiKey: string;
  };
  jwtSecretKey: string;
  serverPort: number;
  secretKey: string;
  environment: string;
  loglyToken: string;
}

// Define a type that omits the password field from User
export type SafeUser = Omit<User, "password">;

// Define the AuthenticatedRequest interface
export interface AuthenticatedRequest extends Request {
  user?: SafeUser;
}

export interface LogEvents {
  (message: string, logName: string): Promise<void>;
}

export interface Logger {
  (req: Request, res: Response, next: NextFunction): void;
}

// Improve EmailOptions interface
export interface EmailOptions {
  subject: string;
  recipientList: string[];
  message: string | null; // Better than optional
  context: Record<string, unknown>; // Better than 'any'
  template: string | null;
}

// Add proper typing for metrics dates
export interface MetricsType {
  initialBalance: number;
  finalBalance: number;
  totalDebit: number;
  totalCredit: number;
  from: string; // Consider using Date
  to: string;   // Consider using Date
  currentDate: string; // Consider using Date
}
