import request from "supertest";
import app from "../src/app";
import {
  deleteUser,
  getUserByAccountNumber,
  getUserById,
  updateUser,
} from "../src/models/userModel";
import { decodeToken } from "../src/utils/jwtUtils";

jest.mock("../src/utils/jwtUtils");
jest.mock("../src/models/userModel");

const mockDecodeToken = decodeToken as jest.MockedFunction<typeof decodeToken>;
const mockGetUserById = getUserById as jest.MockedFunction<typeof getUserById>;
const mockUpdateUser = updateUser as jest.MockedFunction<typeof updateUser>;

describe("Get User Details Controller", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should return 200 and user details successfully", async () => {
    const user = {
      id: 1,
      name: "John Doe",
      email: "john.doe@example.com",
      account_number: "1100110011",
      balance: 100,
      created_at: "2024-06-26T06:36:33.000Z",
      is_admin: false,
      is_blocked: false,
      is_email_confirmed: false,
    };
    mockDecodeToken.mockReturnValue({ userId: "admin123" });

    (getUserById as jest.Mock).mockResolvedValue(user);

    const response = await request(app)
      .get("/api/v1/users/me")
      .set("Authorization", "Bearer validtoken");

    expect(response.status).toBe(200);
    expect(response.body).toEqual(user);
  });

  it("should return 404 if user is not found", async () => {
    (getUserById as jest.Mock).mockResolvedValue(null);

    const response = await request(app)
      .get("/api/v1/users/me")
      .set("Authorization", "Bearer validtoken");

    expect(response.status).toBe(404);
    expect(response.body.message).toBe("User not found");
  });

  it("should return 500 if there is an error fetching user details", async () => {
    mockDecodeToken.mockReturnValue({ userId: "admin123" });

    (getUserById as jest.Mock).mockImplementation(() => {
      throw new Error("Database error");
    });

    const response = await request(app)
      .get("/api/v1/users/me")
      .set("Authorization", "Bearer validtoken");
    console.debug("response", response.body);

    expect(response.status).toBe(500);
    expect(response.body.message).toBe("Error fetching user details");
  });
});

describe("Update User Details Controller", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  const validUser = {
    id: 1,
    name: "John Doe",
    email: "john.doe@example.com",
    account_number: "123456",
  };

  it("should return 200 and update user details successfully", async () => {
    (getUserById as jest.Mock).mockResolvedValue(validUser);
    (updateUser as jest.Mock).mockResolvedValue(true);

    const response = await request(app)
      .put("/api/v1/users/me")
      .send({ name: "John Updated" })
      .set("Authorization", "Bearer validtoken");

    expect(response.status).toBe(200);
    expect(response.body.message).toBe("User updated successfully");
  });

  it("should return 404 if user is not found", async () => {
    (getUserById as jest.Mock).mockResolvedValue(null);

    const response = await request(app)
      .put("/api/v1/users/me")
      .send({ name: "John Updated" })
      .set("Authorization", "Bearer validtoken");

    expect(response.status).toBe(404);
    expect(response.body.message).toBe("User not found");
  });

  it("should return 400 for invalid fields", async () => {
    (getUserById as jest.Mock).mockResolvedValue(validUser);

    const response = await request(app)
      .put("/api/v1/users/me")
      .send({ invalidField: "Invalid" })
      .set("Authorization", "Bearer validtoken");

    expect(response.status).toBe(400);
    expect(response.body.message).toBe(
      "Invalid fields to update: invalidField"
    );
  });

  it("should return 400 for restricted fields", async () => {
    (getUserById as jest.Mock).mockResolvedValue(validUser);

    const response = await request(app)
      .put("/api/v1/users/me")
      .send({ account_number: "654321", email: "new.email@example.com" })
      .set("Authorization", "Bearer validtoken");

    expect(response.status).toBe(400);
    expect(response.body.message).toBe(
      "Field(s) account_number, email cannot be changed, contact admin"
    );
  });

  it("should return 500 if there is an error updating user details", async () => {
    (getUserById as jest.Mock).mockResolvedValue(validUser);
    (updateUser as jest.Mock).mockImplementation(() => {
      throw new Error("Database error");
    });

    const response = await request(app)
      .put("/api/v1/users/me")
      .send({ name: "John Updated" })
      .set("Authorization", "Bearer validtoken");

    expect(response.status).toBe(500);
    expect(response.body.message).toBe("Error updating user details");
  });
});

describe("Delete User Controller", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  const validUser = { id: 1, name: "John Doe", email: "john.doe@example.com" };

  it("should return 200 and delete user successfully", async () => {
    (getUserById as jest.Mock).mockResolvedValue(validUser);
    (deleteUser as jest.Mock).mockResolvedValue(true);

    const response = await request(app)
      .delete("/api/v1/users/me")
      .set("Authorization", "Bearer validtoken");

    expect(response.status).toBe(200);
    expect(response.body.message).toBe("User deleted successfully");
  });

  it("should return 404 if user is not found", async () => {
    (getUserById as jest.Mock).mockResolvedValue(null);

    const response = await request(app)
      .delete("/api/v1/users/me")
      .set("Authorization", "Bearer validtoken");

    expect(response.status).toBe(404);
    expect(response.body.message).toBe("User not found");
  });

  it("should return 500 if there is an error deleting user", async () => {
    (getUserById as jest.Mock).mockResolvedValue(validUser);
    (deleteUser as jest.Mock).mockImplementation(() => {
      throw new Error("Database error");
    });

    const response = await request(app)
      .delete("/api/v1/users/me")
      .set("Authorization", "Bearer validtoken");

    expect(response.status).toBe(500);
    expect(response.body.message).toBe("Error deleting user");
  });
});

describe("Get User By Account Number Controller", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  const validUser = {
    id: 1,
    name: "John Doe",
    account_number: "123456",
    email: "john.doe@example.com",
  };

  it("should return 200 and user details successfully", async () => {
    (getUserByAccountNumber as jest.Mock).mockResolvedValue(validUser);

    const response = await request(app)
      .get("/api/v1/users/account/123456")
      .set("Authorization", "Bearer validtoken");

    expect(response.status).toBe(200);
    expect(response.body).toEqual({
      name: validUser.name,
      accountNumber: validUser.account_number,
    });
  });

  it("should return 404 if user is not found", async () => {
    (getUserByAccountNumber as jest.Mock).mockResolvedValue(null);

    const response = await request(app)
      .get("/api/v1/users/account/654321")
      .set("Authorization", "Bearer validtoken");

    expect(response.status).toBe(404);
    expect(response.body.message).toBe("User not found");
  });

  it("should return 500 if there is an error fetching user", async () => {
    (getUserByAccountNumber as jest.Mock).mockImplementation(() => {
      throw new Error("Database error");
    });

    const response = await request(app)
      .get("/api/v1/users/account/123456")
      .set("Authorization", "Bearer validtoken");

    expect(response.status).toBe(500);
    expect(response.body.message).toBe("Error fetching users");
  });
});
