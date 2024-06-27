// types/index.d.ts
import { Request } from "express";

// The User type
export interface User {
  id: number;
  name: string;
  email: string;
  password: string;
  account_number: string;
  balance: number;
  is_admin: boolean;
  is_blocked: boolean;
  is_email_confirmed: boolean;
  created_at: Date;
  updated_at: Date;
}

// The Transaction type
export interface Transaction {
  id: number;
  user_id: number;
  type: "fund" | "transfer" | "withdraw";
  money_out: number;
  money_in: number;
  description: string;
  recipient_to_from: string;
  balance: number;
  recipient_id?: number;
  created_at: Date;
}

export interface AuthBody {
  name: string;
  email: string;
  password: string;
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
  recipient_account_number?: string;
  recipient_email?: string;
  description?: string;
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

export interface EmailOptions {
  subject: string;
  recipientList: string[];
  message?: string;
  context?: Record<string, any>;
  template?: string;
}
