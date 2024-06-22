import { User } from "./index.d";

declare global {
  namespace Express {
    interface Request {
      user?: User;
    }
  }
}
