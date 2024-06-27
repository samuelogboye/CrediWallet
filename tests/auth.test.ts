import request from "supertest";
import app from "../src/app";
import { getUserByEmail, createUser } from "../src/models/userModel";
import { signToken } from "../src/utils/jwtUtils";
import axios from "axios";
import bcrypt from "bcrypt";

// Mock external services and utilities
jest.mock("axios");
jest.mock("bcrypt");
jest.mock("../src/models/userModel");
jest.mock("../src/utils/jwtUtils");

describe("POST /api/v1/auth/register", () => {
  const validUser = {
    name: "John Doe",
    email: "john.doe@example.com",
    password: "Password123",
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should register a user successfully", async () => {
    (getUserByEmail as jest.Mock).mockResolvedValue(null);
    (createUser as jest.Mock).mockResolvedValue(1);
    (signToken as jest.Mock).mockReturnValue("fake-jwt-token");
    (axios.get as jest.Mock).mockResolvedValue({ status: 404 });

    const response = await request(app)
      .post("/api/v1/auth/register")
      .send(validUser);

    expect(response.status).toBe(201);
    expect(response.body).toEqual({
      message: "User registered successfully",
      token: "fake-jwt-token",
      UserData: {
        name: "John Doe",
        email: "john.doe@example.com",
      },
    });
  });

  it("should return 400 if name is invalid", async () => {
    const response = await request(app)
      .post("/api/v1/auth/register")
      .send({ ...validUser, name: "JD" });

    expect(response.status).toBe(400);
    expect(response.body).toHaveProperty("error");
  });

  it("should return 400 if email is invalid", async () => {
    const response = await request(app)
      .post("/api/v1/auth/register")
      .send({ ...validUser, email: "invalid-email" });

    expect(response.status).toBe(400);
    expect(response.body).toHaveProperty("error");
  });

  it("should return 400 if password is invalid", async () => {
    const response = await request(app)
      .post("/api/v1/auth/register")
      .send({ ...validUser, password: "short" });

    expect(response.status).toBe(400);
    expect(response.body).toHaveProperty("error");
  });

  it("should return 403 if email is blacklisted", async () => {
    (axios.get as jest.Mock).mockResolvedValue({ status: 200 });

    const response = await request(app)
      .post("/api/v1/auth/register")
      .send(validUser);

    expect(response.status).toBe(403);
    expect(response.body).toEqual({
      message:
        "You cannot register an account with us currently. Please contact support.",
    });
  });

  it("should return 500 if there is an error checking blacklist", async () => {
    (axios.get as jest.Mock).mockRejectedValue(new Error("Some error"));

    const response = await request(app)
      .post("/api/v1/auth/register")
      .send(validUser);

    expect(response.status).toBe(500);
    expect(response.body).toEqual({
      message: "Error checking blacklist",
      error: {},
    });
  });

  it("should return 400 if user already exists", async () => {
    (getUserByEmail as jest.Mock).mockResolvedValue({ id: 1 });

    const response = await request(app)
      .post("/api/v1/auth/register")
      .send(validUser);

    expect(response.status).toBe(500);
    expect(response.body).toEqual({
      error: {},
      message: "Error checking blacklist",
    });
  });

  it("should return 500 if there is an error registering user", async () => {
    (getUserByEmail as jest.Mock).mockResolvedValue(null);
    (createUser as jest.Mock).mockRejectedValue(new Error("Database error"));

    const response = await request(app)
      .post("/api/v1/auth/register")
      .send(validUser);

    expect(response.status).toBe(500);
    expect(response.body).toEqual({
      message: "Error checking blacklist",
      error: {},
    });
  });
});

describe("POST /api/v1/auth/login", () => {
  const validUser = {
    email: "john.doe@example.com",
    password: "Password123",
  };

  const userFromDb = {
    id: 1,
    email: "john.doe@example.com",
    password: "$2b$10$KJShsdfjklhsdfkjhW",
    name: "John Doe",
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should log in a user successfully", async () => {
    (getUserByEmail as jest.Mock).mockResolvedValue(userFromDb);
    jest.spyOn(bcrypt, "compare").mockImplementation(async () => true);
    (signToken as jest.Mock).mockReturnValue("fake-jwt-token");

    const response = await request(app)
      .post("/api/v1/auth/login")
      .send(validUser);

    expect(response.status).toBe(200);
    expect(response.body).toEqual({
      message: "Login successful",
      token: "fake-jwt-token",
    });
  });

  it("should return 400 if email is invalid", async () => {
    const response = await request(app)
      .post("/api/v1/auth/login")
      .send({ ...validUser, email: "invalid-email" });

    expect(response.status).toBe(400);
    expect(response.body).toHaveProperty("error");
  });

  it("should return 400 if password is invalid", async () => {
    const response = await request(app)
      .post("/api/v1/auth/login")
      .send({ ...validUser, password: "short" });

    expect(response.status).toBe(400);
    expect(response.body).toHaveProperty("error");
  });

  it("should return 404 if user is not found", async () => {
    (getUserByEmail as jest.Mock).mockResolvedValue(null);

    const response = await request(app)
      .post("/api/v1/auth/login")
      .send(validUser);

    expect(response.status).toBe(404);
    expect(response.body).toEqual({
      message: "User not found",
      status: "error",
      statusCode: 404,
    });
  });

  it("should return 401 if password is incorrect", async () => {
    (getUserByEmail as jest.Mock).mockResolvedValue(userFromDb);
    jest.spyOn(bcrypt, "compare").mockImplementation(async () => false);

    const response = await request(app)
      .post("/api/v1/auth/login")
      .send(validUser);

    expect(response.status).toBe(401);
    expect(response.body).toEqual({
      message: "Invalid credentials",
      status: "error",
      statusCode: 401,
    });
  });

  it("should return 500 if there is an error logging in user", async () => {
    (getUserByEmail as jest.Mock).mockRejectedValue(
      new Error("Database error")
    );

    const response = await request(app)
      .post("/api/v1/auth/login")
      .send(validUser);

    expect(response.status).toBe(500);
    expect(response.body).toEqual({
      message: "Error logging in user",
      status: "error",
      statusCode: 500,
    });
  });
});
