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

export interface AuthBody {
  name: string;
  email: string;
  password: string;
}

// A type for the response of the Lendsqr Adjutor Karma blacklist API
// export interface BlacklistResponse {
//   isBlacklisted: boolean;
// }

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
export interface Config {
  db: {
    host: string;
    user: string;
    password: string;
    database: string;
    port: number;
  };
  adjutor: {
    apiUrl: string;
    apiKey: string;
  };
  jwtSecretKey: string;
  serverPort: number;
}

export interface AuthenticatedRequest extends Request {
  user?: User;
  //   body: AuthBody;
}

// export interface TransactionRequest extends Request {
//   user?: User;
//   //   body: TransactionRequestBody;
// }
