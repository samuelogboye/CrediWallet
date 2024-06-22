import { Request, Response } from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
// import knex from "../utils/db";
import { User } from "../types";

const SECRET_KEY = process.env.SECRET_KEY;

// Register a new user
export const register = async (req: Request, res: Response) => {
  const { name, email, password } = req.body;

  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    console.log("name", name);
    console.log("email", email);
    console.log("password", password, hashedPassword);
    const userId = 11;
    // const [userId] = await knex("users").insert({
    //   name,
    //   email,
    //   password: hashedPassword,
    // });

    const token = jwt.sign({ userId, email }, SECRET_KEY, { expiresIn: "1h" });

    res.status(201).json({ message: "User registered successfully", token });
  } catch (error) {
    res.status(500).json({ message: "Error registering user", error });
  }
};

// Log in an existing user
// export const login = async (req: Request, res: Response) => {
//   const { email, password } = req.body;

//   try {
//     const user: User = await knex("users").where({ email }).first();

//     if (!user) {
//       return res.status(404).json({ message: "User not found" });
//     }

//     const isValidPassword = await bcrypt.compare(password, user.password);

//     if (!isValidPassword) {
//       return res.status(401).json({ message: "Invalid password" });
//     }

//     const token = jwt.sign({ userId: user.id, email: user.email }, SECRET_KEY, {
//       expiresIn: "1h",
//     });

//     res.status(200).json({ message: "Login successful", token });
//   } catch (error) {
//     res.status(500).json({ message: "Error logging in user", error });
//   }
// };
