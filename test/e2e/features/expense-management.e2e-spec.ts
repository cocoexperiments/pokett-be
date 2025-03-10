import { Test, TestingModule } from "@nestjs/testing";
import { INestApplication, ValidationPipe } from "@nestjs/common";
import * as request from "supertest";
import { AppModule } from "../../../src/app.module";
import { Connection } from "mongoose";
import { getConnectionToken } from "@nestjs/mongoose";
import { authenticateUser, getAuthHeader } from "../helpers/auth.helper";
import "../../test-config"; // This will load and validate test environment
import { setupTestContext, TestContext } from "../helpers/test-setup.helper";

describe("Expense Management (e2e)", () => {
  let testContext: TestContext;

  beforeAll(async () => {
    testContext = await setupTestContext();
  });

  beforeEach(async () => {
    // Clean up the database before each test
    await testContext.connection.dropDatabase();
    
    // Set up fresh test context for each test
    testContext = await setupTestContext();
  });

  afterAll(async () => {
    await testContext.connection.dropDatabase();
    await testContext.app.close();
  });

  it("Should be able to create a categorised expense in a group", async () => {
    const { app, authHeader, groupId, categoryId, userA, userB, userC } = testContext;
    
    // Create an expense using the category
    const createExpenseResponse = await request(app.getHttpServer())
      .post("/api/expenses")
      .set(authHeader)
      .send({
        groupId,
        amount: 300,
        description: "Dinner",
        categoryId,
        paidBy: userA._id,
        shares: [
          { userId: userA._id, amount: 100 },
          { userId: userB._id, amount: 100 },
          { userId: userC._id, amount: 100 }
        ],
        createdBy: userA._id
      });

    expect(createExpenseResponse.status).toBe(201);
    expect(createExpenseResponse.body.amount).toBe(300);
    expect(createExpenseResponse.body.description).toBe("Dinner");
  });

  it("Should be able to create an expense outside a group", async () => {
    const { app, authHeader, categoryId, userA, userB } = testContext;
    
    const createExpenseResponse = await request(app.getHttpServer())
      .post("/api/expenses")
      .set(authHeader)
      .send({
        amount: 200,
        description: "Movie",
        categoryId,
        paidBy: userA._id,
        shares: [
          { userId: userA._id, amount: 100 },
          { userId: userB._id, amount: 100 }
        ],
        createdBy: userA._id
      });
      
    expect(createExpenseResponse.status).toBe(201);
    expect(createExpenseResponse.body.amount).toBe(200);
    expect(createExpenseResponse.body.description).toBe("Movie");
  });

  it("Should be able to get expenses for a group", async () => {
    const { app, authHeader, groupId, categoryId, userA, userB, userC } = testContext;
    
    // Create an expense in the group
    await request(app.getHttpServer())
      .post("/api/expenses")
      .set(authHeader)
      .send({
        groupId,
        amount: 300,
        description: "Dinner",
        categoryId,
        paidBy: userA._id,
        shares: [
          { userId: userA._id, amount: 100 },
          { userId: userB._id, amount: 100 },
          { userId: userC._id, amount: 100 }
        ],
        createdBy: userA._id
      });
      
    // Get expenses for the group
    const getExpensesResponse = await request(app.getHttpServer())
      .get(`/api/expenses?groupId=${groupId}`)
      .set(authHeader);
      
    expect(getExpensesResponse.status).toBe(200);
    expect(getExpensesResponse.body).toHaveLength(1);
    expect(getExpensesResponse.body[0].description).toBe("Dinner");
  });
});
