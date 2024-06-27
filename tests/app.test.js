"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
process.env.NODE_ENV = "test";
const supertest_1 = __importDefault(require("supertest"));
const app_1 = __importDefault(require("../src/app"));
describe("Test app.ts", () => {
    test("Catch-all route", async () => {
        const res = await (0, supertest_1.default)(app_1.default).get("/");
        expect(res.body).toEqual({ message: "Welcome to CrediWallet" });
    });
});
//# sourceMappingURL=app.test.js.map