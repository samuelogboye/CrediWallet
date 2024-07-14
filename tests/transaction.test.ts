import request from "supertest";
import app from "../src/app";
import { decodeToken } from "../src/utils/jwtUtils";
import {
  getUserByAccountNumber,
  getUserById,
  updateUserBalance,
} from "../src/models/userModel";
import { SafeUser } from "../src/types";
import {
  createTransaction,
  getPaginatedTransactionsByUserId,
  isDuplicateTransaction,
} from "../src/models/transactionModel";

// Mock functions
jest.mock("../src/utils/jwtUtils");
jest.mock("../src/models/userModel");
jest.mock("../src/models/transactionModel");
jest.mock("../src/models/transactionModel");
jest.mock("../src/utils/db.ts", () => ({
  transaction: jest.fn().mockReturnValue({
    rollback: jest.fn(),
    commit: jest.fn(),
  }),
}));

const mockDecodeToken = decodeToken as jest.MockedFunction<typeof decodeToken>;
const mockGetUserById = getUserById as jest.MockedFunction<typeof getUserById>;
const mockUpdateUserBalance = updateUserBalance as jest.MockedFunction<
  typeof updateUserBalance
>;
const mockCreateTransaction = createTransaction as jest.MockedFunction<
  typeof createTransaction
>;

describe("Fund Account Controller", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should fund account successfully", async () => {
    const mockUser: SafeUser = { id: 1, balance: 100, name: "user123" };
    mockDecodeToken.mockReturnValue({ userId: "user123" });
    mockGetUserById.mockResolvedValue(mockUser);
    mockUpdateUserBalance.mockResolvedValue();
    mockCreateTransaction.mockResolvedValue(1);

    const response = await request(app)
      .post("/api/v1/transactions/fund")
      .set("Authorization", "Bearer validtoken")
      .send({ amount: 50 });

    expect(response.status).toBe(201);
    expect(response.body).toEqual({
      message: "Account funded successfully",
      transactionId: 1,
      currentBalance: 150,
      userName: mockUser.name,
    });
  });

  it("should return 404 if user is not found", async () => {
    mockDecodeToken.mockReturnValue({ userId: NaN });
    //@ts-ignore
    mockGetUserById.mockResolvedValue(null);

    const response = await request(app)
      .post("/api/v1/transactions/fund")
      .set("Authorization", "Bearer validtoken")
      .send({ amount: 50 });

    expect(response.status).toBe(404);
    expect(response.body).toEqual({
      message: "User not found",
      status: "error",
      statusCode: 404,
    });
  });
  it("should return 400 if amount is invalid", async () => {
    const mockUser: SafeUser = { id: 1, balance: 100, name: "user123" };
    mockDecodeToken.mockReturnValue({ userId: "user123" });
    mockGetUserById.mockResolvedValue(mockUser);

    const response = await request(app)
      .post("/api/v1/transactions/fund")
      .set("Authorization", "Bearer validtoken")
      .send({ amount: -50 });

    expect(response.status).toBe(400);
    expect(response.body).toEqual({
      message: "Amount must be greater than zero",
      status: "error",
      statusCode: 400,
    });
  });
});

describe("Transfer Controller", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should return 400 if recipient information is missing", async () => {
    const response = await request(app)
      .post("/api/v1/transactions/transfer")
      .send({ type: "transfer", amount: 100 })
      .set("Authorization", "Bearer validtoken");
    expect(response.status).toBe(404);
    expect(response.body.message).toBe("Recipient not found");
  });

  it("should return 400 if user tries to transfer to self by ID", async () => {
    (getUserById as jest.Mock).mockResolvedValue({ id: 1, name: "Test User" });

    const response = await request(app)
      .post("/api/v1/transactions/transfer")
      .send({ type: "transfer", amount: 100, recipient_id: 1 })
      .set("Authorization", "Bearer validtoken");
    expect(response.status).toBe(400);
    expect(response.body.message).toBe("Cannot create transaction with self");
  });

  it("should return 400 if user tries to transfer to self by account number", async () => {
    (getUserById as jest.Mock).mockResolvedValue({
      id: 1,
      account_number: "123",
    });
    (getUserByAccountNumber as jest.Mock).mockResolvedValue({
      account_number: "123",
    });

    const response = await request(app)
      .post("/api/v1/transactions/transfer")
      .send({ type: "transfer", amount: 100, recipient_account_number: "123" })
      .set("Authorization", "Bearer validtoken");
    expect(response.status).toBe(400);
    expect(response.body.message).toBe("Cannot create transaction with self");
  });

  it("should return 400 if insufficient funds", async () => {
    (getUserById as jest.Mock).mockResolvedValue({ id: NaN, balance: 50 });

    const response = await request(app)
      .post("/api/v1/transactions/transfer")
      .send({ type: "transfer", amount: 100, recipient_id: 12345 })
      .set("Authorization", "Bearer validtoken");
    expect(response.status).toBe(400);
    expect(response.body.message).toBe("Insufficient funds");
  });

  it("should return 400 for duplicate transaction", async () => {
    (getUserById as jest.Mock).mockResolvedValue({ id: 1, balance: 200 });
    (isDuplicateTransaction as jest.Mock).mockResolvedValue(true);

    const response = await request(app)
      .post("/api/v1/transactions/transfer")
      .send({ type: "transfer", amount: 100, recipient_id: 2 })
      .set("Authorization", "Bearer validtoken");
    expect(response.status).toBe(400);
    expect(response.body.message).toBe("Cannot create transaction with self");
  });

  it("should return 201 for successful transfer", async () => {
    (getUserById as jest.Mock).mockResolvedValue({ id: 1, balance: 200 });
    (getUserById as jest.Mock).mockResolvedValueOnce({ id: 2, balance: 100 });
    (isDuplicateTransaction as jest.Mock).mockResolvedValue(false);
    (createTransaction as jest.Mock).mockResolvedValue(1);

    const response = await request(app)
      .post("/api/v1/transactions/transfer")
      .send({
        type: "transfer",
        amount: 100,
        recipient_id: 2,
        description: "Birthday Money",
      })
      .set("Authorization", "Bearer validtoken");
    expect(response.status).toBe(200);
    expect(response.body.message).toBe("Transfer successful");
  });
});

describe("Withdraw Controller", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should return 404 if user is not found", async () => {
    (getUserById as jest.Mock).mockResolvedValue(null);

    const response = await request(app)
      .post("/api/v1/transactions/withdraw")
      .send({ amount: 100 })
      .set("Authorization", "Bearer validtoken");

    expect(response.status).toBe(404);
    expect(response.body.message).toBe("User not found");
  });

  it("should return 400 if user has insufficient funds", async () => {
    (getUserById as jest.Mock).mockResolvedValue({
      id: 1,
      balance: 50,
      name: "Test User",
    });

    const response = await request(app)
      .post("/api/v1/transactions/withdraw")
      .send({ amount: 100 })
      .set("Authorization", "Bearer validtoken");

    expect(response.status).toBe(400);
    expect(response.body.message).toBe("Insufficient funds");
  });

  it("should return 201 for successful withdrawal", async () => {
    (getUserById as jest.Mock).mockResolvedValue({
      id: 1,
      balance: 200,
      name: "Test User",
    });
    (createTransaction as jest.Mock).mockResolvedValue(1);

    const response = await request(app)
      .post("/api/v1/transactions/withdraw")
      .send({ amount: 100 })
      .set("Authorization", "Bearer validtoken");

    expect(response.status).toBe(201);
    expect(response.body.message).toBe("Withdrawal successful");
    expect(response.body).toMatchObject({
      transactionId: 1,
      amounWithdrawn: 100,
      balanceBefore: 200,
      finalBalance: 100,
      userName: "Test User",
    });
  });
});

describe("Get Transaction History", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should return 200 and transaction history successfully", async () => {
    const transactions = [
      { id: 1, type: "transfer", amount: 100, balance: 900, user_id: 1 },
      { id: 2, type: "withdraw", amount: 50, balance: 850, user_id: 1 },
    ];
    (getPaginatedTransactionsByUserId as jest.Mock).mockResolvedValue(
      transactions
    );

    const response = await request(app)
      .get("/api/v1/transactions")
      .set("Authorization", "Bearer validtoken");

    expect(response.status).toBe(200);
    expect(response.body.message).toBe(
      "Transaction history retrieved successfully"
    );
    expect(response.body.transactionCount).toBe(2);
    expect(response.body.transactions).toEqual(transactions);
  });

  it("should return 200 with empty transaction history", async () => {
    (getPaginatedTransactionsByUserId as jest.Mock).mockResolvedValue([]);

    const response = await request(app)
      .get("/api/v1/transactions")
      .set("Authorization", "Bearer validtoken");

    expect(response.status).toBe(200);
    expect(response.body.message).toBe(
      "Transaction history retrieved successfully"
    );
    expect(response.body.transactionCount).toBe(0);
    expect(response.body.transactions).toEqual([]);
  });

  it("should correctly handle pagination parameters", async () => {
    const transactions = [
      { id: 1, type: "transfer", amount: 100, balance: 900, user_id: 1 },
    ];
    (getPaginatedTransactionsByUserId as jest.Mock).mockResolvedValue(
      transactions
    );

    const response = await request(app)
      .get("/api/v1/transactions?page=1&limit=1")
      .set("Authorization", "Bearer validtoken");

    expect(response.status).toBe(200);
    expect(response.body.message).toBe(
      "Transaction history retrieved successfully"
    );
    expect(response.body.transactionCount).toBe(1);
    expect(response.body.transactions).toEqual(transactions);
  });

  it("should return 500 if there is an error fetching transactions", async () => {
    (getPaginatedTransactionsByUserId as jest.Mock).mockImplementation(() => {
      throw new Error("Database error");
    });

    const response = await request(app)
      .get("/api/v1/transactions")
      .set("Authorization", "Bearer validtoken");

    expect(response.status).toBe(500);
    expect(response.body.message).toBe("Error fetching transaction history");
  });
});
