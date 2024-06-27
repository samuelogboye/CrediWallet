"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const supertest_1 = __importDefault(require("supertest"));
const app_1 = __importDefault(require("../src/app"));
const jwtUtils_1 = require("../src/utils/jwtUtils");
const userModel_1 = require("../src/models/userModel");
jest.mock("../src/utils/jwtUtils");
jest.mock("../src/models/userModel");
const mockDecodeToken = jwtUtils_1.decodeToken;
const mockGetUserById = userModel_1.getUserById;
const mockGetAllUsers = userModel_1.getAllUsers;
const mockUpdateUser = userModel_1.updateUser;
describe("PUT /api/v1/admin/block/:userId", () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });
    it("should block a user successfully", async () => {
        mockDecodeToken.mockReturnValue({ userId: "admin123" });
        mockGetUserById
            .mockResolvedValueOnce({ id: 1, is_admin: true })
            .mockResolvedValueOnce({ id: 1, is_admin: false, is_blocked: false });
        mockUpdateUser.mockResolvedValue(undefined);
        const response = await (0, supertest_1.default)(app_1.default)
            .put("/api/v1/admin/block/1")
            .set("Authorization", "Bearer validtoken");
        expect(response.status).toBe(200);
        expect(response.body).toEqual({
            message: "User blocked successfully",
        });
        expect(mockUpdateUser).toHaveBeenCalledWith(1, { is_blocked: true });
    });
    it("should return 404 if user does not exist", async () => {
        mockDecodeToken.mockReturnValue({ userId: "admin123" });
        mockGetUserById.mockResolvedValueOnce({ id: 1, is_admin: true });
        const response = await (0, supertest_1.default)(app_1.default)
            .put("/api/v1/admin/block/999")
            .set("Authorization", "Bearer validtoken");
        expect(response.status).toBe(404);
        expect(response.body).toEqual({
            message: "User not found",
            status: "error",
            statusCode: 404,
        });
    });
    it("should return 401 if not authenticated", async () => {
        const response = await (0, supertest_1.default)(app_1.default).put("/api/v1/admin/block/1");
        expect(response.status).toBe(401);
        expect(response.body).toEqual({
            message: "Unauthorized Access",
            status: "error",
            statusCode: 401,
        });
    });
    it("should return 403 if user is not an admin", async () => {
        mockDecodeToken.mockReturnValue({ userId: "user123" });
        mockGetUserById.mockResolvedValue({ id: 2, is_admin: false });
        const response = await (0, supertest_1.default)(app_1.default)
            .put("/api/v1/admin/block/1")
            .set("Authorization", "Bearer validtoken");
        expect(response.status).toBe(403);
        expect(response.body).toEqual({
            message: "Admin access required",
            status: "error",
            statusCode: 403,
        });
    });
    it("should return 500 if there is an error blocking the user", async () => {
        mockDecodeToken.mockReturnValue({ userId: "admin123" });
        mockGetUserById
            .mockResolvedValueOnce({ id: 1, is_admin: true })
            .mockResolvedValueOnce({ id: 1, is_admin: false, is_blocked: false });
        mockUpdateUser.mockRejectedValue(new Error("Database error"));
        const response = await (0, supertest_1.default)(app_1.default)
            .put("/api/v1/admin/block/1")
            .set("Authorization", "Bearer validtoken");
        expect(response.status).toBe(500);
        expect(response.body).toEqual({
            message: "Error blocking user",
            status: "error",
            statusCode: 500,
        });
    });
    it("should handle non-numeric user IDs", async () => {
        mockDecodeToken.mockReturnValue({ userId: NaN });
        mockGetUserById.mockResolvedValueOnce({ id: 1, is_admin: true });
        const response = await (0, supertest_1.default)(app_1.default)
            .put("/api/v1/admin/block/abc")
            .set("Authorization", "Bearer validtoken");
        expect(response.status).toBe(404);
        expect(response.body).toEqual({
            message: "Invalid user ID",
            status: "error",
            statusCode: 404,
        });
        expect(mockGetUserById).toHaveBeenCalledWith(NaN);
        expect(mockUpdateUser).not.toHaveBeenCalled();
    });
});
describe("PUT /api/v1/admin/unblock/:userId", () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });
    it("should unblock a user successfully", async () => {
        mockDecodeToken.mockReturnValue({ userId: "admin123" });
        mockGetUserById
            .mockResolvedValueOnce({ id: 1, is_admin: true })
            .mockResolvedValueOnce({ id: 2, is_admin: false, is_blocked: true });
        mockUpdateUser.mockResolvedValue(undefined);
        const response = await (0, supertest_1.default)(app_1.default)
            .put("/api/v1/admin/unblock/2")
            .set("Authorization", "Bearer validtoken");
        expect(response.status).toBe(200);
        expect(response.body).toEqual({
            message: "User unblocked successfully",
        });
        expect(mockUpdateUser).toHaveBeenCalledWith(2, { is_blocked: false });
    });
    it("should return 404 if user does not exist", async () => {
        mockDecodeToken.mockReturnValue({ userId: NaN });
        mockGetUserById.mockResolvedValueOnce({ id: 1, is_admin: true });
        const response = await (0, supertest_1.default)(app_1.default)
            .put("/api/v1/admin/unblock/abc")
            .set("Authorization", "Bearer validtoken");
        expect(response.status).toBe(404);
        expect(response.body).toEqual({
            message: "Invalid user ID",
            status: "error",
            statusCode: 404,
        });
    });
    it("should return 401 if not authenticated", async () => {
        const response = await (0, supertest_1.default)(app_1.default).put("/api/v1/admin/unblock/2");
        expect(response.status).toBe(401);
        expect(response.body).toEqual({
            message: "Unauthorized Access",
            status: "error",
            statusCode: 401,
        });
    });
    it("should return 403 if user is not an admin", async () => {
        mockDecodeToken.mockReturnValue({ userId: "user123" });
        mockGetUserById.mockResolvedValue({ id: 2, is_admin: false });
        const response = await (0, supertest_1.default)(app_1.default)
            .put("/api/v1/admin/unblock/2")
            .set("Authorization", "Bearer validtoken");
        expect(response.status).toBe(403);
        expect(response.body).toEqual({
            message: "Admin access required",
            status: "error",
            statusCode: 403,
        });
    });
    it("should return 500 if there is an error unblocking the user", async () => {
        mockDecodeToken.mockReturnValue({ userId: "admin123" });
        mockGetUserById
            .mockResolvedValueOnce({ id: 1, is_admin: true })
            .mockResolvedValueOnce({ id: 2, is_admin: false, is_blocked: true });
        mockUpdateUser.mockRejectedValue(new Error("Database error"));
        const response = await (0, supertest_1.default)(app_1.default)
            .put("/api/v1/admin/unblock/2")
            .set("Authorization", "Bearer validtoken");
        expect(response.status).toBe(500);
        expect(response.body).toEqual({
            message: "Error unblocking user",
            status: "error",
            statusCode: 500,
        });
    });
    it("should handle non-numeric user IDs", async () => {
        mockDecodeToken.mockReturnValue({ userId: NaN });
        mockGetUserById.mockResolvedValueOnce({ id: 1, is_admin: true });
        const response = await (0, supertest_1.default)(app_1.default)
            .put("/api/v1/admin/unblock/abc")
            .set("Authorization", "Bearer validtoken");
        expect(response.status).toBe(404);
        expect(response.body).toEqual({
            message: "Invalid user ID",
            status: "error",
            statusCode: 404,
        });
        expect(mockGetUserById).toHaveBeenCalledWith(NaN);
        expect(mockUpdateUser).not.toHaveBeenCalled();
    });
});
describe("GET /api/v1/admin/get-users", () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });
    it("should return 200 and all users for an authenticated admin", async () => {
        mockDecodeToken.mockReturnValue({ userId: "admin123" });
        mockGetUserById.mockResolvedValue({ id: 1, is_admin: true });
        mockGetAllUsers.mockResolvedValue([
            { id: 1, name: "User One" },
            { id: 2, name: "User Two" },
        ]);
        const response = await (0, supertest_1.default)(app_1.default)
            .get("/api/v1/admin/get-users")
            .set("Authorization", "Bearer validtoken");
        expect(response.status).toBe(200);
        expect(response.body).toEqual([
            { id: 1, name: "User One" },
            { id: 2, name: "User Two" },
        ]);
    });
    it("should return 401 if Authorization header is missing", async () => {
        const response = await (0, supertest_1.default)(app_1.default).get("/api/v1/admin/get-users");
        expect(response.status).toBe(401);
        expect(response.body).toEqual({
            message: "Unauthorized Access",
            status: "error",
            statusCode: 401,
        });
    });
    it("should return 401 if token is invalid", async () => {
        mockDecodeToken.mockImplementation(() => {
            throw new Error("Invalid token");
        });
        const response = await (0, supertest_1.default)(app_1.default)
            .get("/api/v1/admin/get-users")
            .set("Authorization", "Bearer invalidtoken");
        expect(response.status).toBe(401);
        expect(response.body).toEqual({
            message: "Invalid or expired token",
            status: "error",
            statusCode: 401,
        });
    });
    it("should return 403 if user is not an admin", async () => {
        mockDecodeToken.mockReturnValue({ userId: 2 });
        mockGetUserById.mockResolvedValue({ id: 2, is_admin: false });
        const response = await (0, supertest_1.default)(app_1.default)
            .get("/api/v1/admin/get-users")
            .set("Authorization", "Bearer validtoken");
        expect(response.status).toBe(403);
        expect(response.body).toEqual({
            message: "Admin access required",
            status: "error",
            statusCode: 403,
        });
    });
    it("should return 500 if there is an error fetching users", async () => {
        mockDecodeToken.mockReturnValue({ userId: "admin123" });
        mockGetUserById.mockResolvedValue({ id: 1, is_admin: true });
        mockGetAllUsers.mockRejectedValue(new Error("Database error"));
        const response = await (0, supertest_1.default)(app_1.default)
            .get("/api/v1/admin/get-users")
            .set("Authorization", "Bearer validtoken");
        expect(response.status).toBe(500);
        expect(response.body).toEqual({
            message: "Error fetching users",
            status: "error",
            statusCode: 500,
        });
    });
});
describe("PUT /api/v1/admin/make-admin/:userId", () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });
    it("should make a user an admin successfully", async () => {
        mockDecodeToken.mockReturnValue({ userId: "admin123" });
        mockGetUserById
            .mockResolvedValueOnce({ id: 1, is_admin: true })
            .mockResolvedValueOnce({ id: 2, is_admin: false });
        mockUpdateUser.mockResolvedValue(undefined);
        const response = await (0, supertest_1.default)(app_1.default)
            .put("/api/v1/admin/make-admin/2")
            .set("Authorization", "Bearer validtoken");
        expect(response.status).toBe(200);
        expect(response.body).toEqual({
            message: "User granted admin privileges",
        });
        expect(mockUpdateUser).toHaveBeenCalledWith(2, { is_admin: true });
    });
    it("should return 401 if not authenticated", async () => {
        const response = await (0, supertest_1.default)(app_1.default).put("/api/v1/admin/make-admin/2");
        expect(response.status).toBe(401);
        expect(response.body).toEqual({
            status: "error",
            statusCode: 401,
            message: "Unauthorized Access",
        });
    });
    it("should return 403 if user is not an admin", async () => {
        mockDecodeToken.mockReturnValue({ userId: "user123" });
        mockGetUserById.mockResolvedValue({ id: 2, is_admin: false });
        const response = await (0, supertest_1.default)(app_1.default)
            .put("/api/v1/admin/make-admin/2")
            .set("Authorization", "Bearer validtoken");
        expect(response.status).toBe(403);
        expect(response.body).toEqual({
            status: "error",
            statusCode: 403,
            message: "Admin access required",
        });
    });
    it("should return 500 if there is an error making the user an admin", async () => {
        mockDecodeToken.mockReturnValue({ userId: "admin123" });
        mockGetUserById
            .mockResolvedValueOnce({ id: 1, is_admin: true })
            .mockResolvedValueOnce({ id: 2, is_admin: false });
        mockUpdateUser.mockRejectedValue(new Error("Database error"));
        const response = await (0, supertest_1.default)(app_1.default)
            .put("/api/v1/admin/make-admin/2")
            .set("Authorization", "Bearer validtoken");
        expect(response.status).toBe(500);
        expect(response.body).toEqual({
            status: "error",
            statusCode: 500,
            message: "Error granting admin privileges",
        });
    });
});
describe("PUT /api/v1/admin/remove-admin/:userId", () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });
    it("should remove admin privileges successfully", async () => {
        mockDecodeToken.mockReturnValue({ userId: "admin123" });
        mockGetUserById
            .mockResolvedValueOnce({ id: 1, is_admin: true })
            .mockResolvedValueOnce({ id: 2, is_admin: true });
        mockUpdateUser.mockResolvedValue(undefined);
        const response = await (0, supertest_1.default)(app_1.default)
            .put("/api/v1/admin/remove-admin/2")
            .set("Authorization", "Bearer validtoken");
        expect(response.status).toBe(200);
        expect(response.body).toEqual({
            message: "Admin privileges removed from user",
        });
        expect(mockUpdateUser).toHaveBeenCalledWith(2, { is_admin: false });
    });
    it("should return 401 if not authenticated", async () => {
        const response = await (0, supertest_1.default)(app_1.default).put("/api/v1/admin/remove-admin/2");
        expect(response.status).toBe(401);
        expect(response.body).toEqual({
            status: "error",
            statusCode: 401,
            message: "Unauthorized Access",
        });
    });
    it("should return 403 if user is not an admin", async () => {
        mockDecodeToken.mockReturnValue({ userId: "user123" });
        mockGetUserById.mockResolvedValue({ id: 2, is_admin: false });
        const response = await (0, supertest_1.default)(app_1.default)
            .put("/api/v1/admin/remove-admin/2")
            .set("Authorization", "Bearer validtoken");
        expect(response.status).toBe(403);
        expect(response.body).toEqual({
            status: "error",
            statusCode: 403,
            message: "Admin access required",
        });
    });
    it("should return 500 if there is an error removing admin privileges", async () => {
        mockDecodeToken.mockReturnValue({ userId: "admin123" });
        mockGetUserById
            .mockResolvedValueOnce({ id: 1, is_admin: true })
            .mockResolvedValueOnce({ id: 2, is_admin: true });
        mockUpdateUser.mockRejectedValue(new Error("Database error"));
        const response = await (0, supertest_1.default)(app_1.default)
            .put("/api/v1/admin/remove-admin/2")
            .set("Authorization", "Bearer validtoken");
        expect(response.status).toBe(500);
        expect(response.body).toEqual({
            status: "error",
            statusCode: 500,
            message: "Error removing admin privileges",
        });
    });
});
//# sourceMappingURL=admin.test.js.map