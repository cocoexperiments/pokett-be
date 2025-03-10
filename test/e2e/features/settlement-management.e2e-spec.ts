import * as request from "supertest";
import { setupTestContext, TestContext, cleanupTestApp } from "../helpers/test-setup.helper";
import { BalanceFactory } from "../helpers/factories/balance.factory";

describe("Settlement Management (e2e)", () => {
  let testContext: TestContext;

  beforeAll(async () => {
    testContext = await setupTestContext();
  });

  beforeEach(async () => {
    // Clean up the database before each test
    await testContext.connection.dropDatabase();
    
    // Create an expense to generate balances
    await createTestExpense(testContext);
  });

  afterAll(async () => {
    await testContext.connection.dropDatabase();
    await cleanupTestApp(testContext.app, testContext.connection);
  });

  it("Should be able to settle all the balance with User C in group", async () => {
    const { app, authHeader, userC, userA } = testContext;

    // Create initial balance
    await BalanceFactory.createForDb({
      creditorId: userA._id,
      debtorId: userC._id,
      amount: 100
    });
      
    // Verify initial balance
    const balanceResponseBeforeSettle = await request(app.getHttpServer())
      .get(`/api/balances`)
      .set(authHeader);
    
    expect(balanceResponseBeforeSettle.status).toBe(200);
    expect(Array.isArray(balanceResponseBeforeSettle.body)).toBe(true);

    // Find User C's balance (should be negative since they owe money)
    const userCBalanceBeforeSettle = balanceResponseBeforeSettle.body.find(
      (balance: any) => balance.userId === userC._id.toString()
    );

    expect(userCBalanceBeforeSettle).toBeDefined();
    expect(userCBalanceBeforeSettle.amount).toBe(-100); // Negative because User C owes money

    // Settle the balance
    const settleResponse = await request(app.getHttpServer())
      .post("/api/balances/settle")
      .set(authHeader)
      .send({
        userId: userC._id,
        amount: 100,
      });
    
    expect(settleResponse.status).toBe(201);

    // Verify settlement
    const balanceResponse = await request(app.getHttpServer())
      .get(`/api/balances`)
      .set(authHeader);
    
    expect(balanceResponse.status).toBe(200);
    expect(Array.isArray(balanceResponse.body)).toBe(true);

    const userCBalance = balanceResponse.body.find(
      (balance: any) => balance.userId === userC._id.toString()
    );
    
    expect(userCBalance).toBeDefined();
    expect(userCBalance.amount).toBe(0);
  });

  it("Should be able to settle all the balance with User B outside and within the group", async () => {
    const { app, authHeader, groupId, userA, userB } = testContext;
    
    // Create a non-group expense to generate balance outside the group
    await createNonGroupExpense(testContext);
    
    const settleGroupResponse = await request(app.getHttpServer())
      .post("/api/settlements")
      .set(authHeader)
      .send({
        groupId,
        paidBy: userA._id,
        paidTo: userB._id,
        amount: 100,
      });
    expect(settleGroupResponse.status).toBe(201);

    const settleNonGroupResponse = await request(app.getHttpServer())
      .post("/api/settlements")
      .set(authHeader)
      .send({
        paidBy: userA._id,
        paidTo: userB._id,
        amount: 100,
      });
    expect(settleNonGroupResponse.status).toBe(201);

    // Verify total settlement
    const balanceResponse = await request(app.getHttpServer())
      .get(`/api/balances/users/${userA._id}/${userB._id}`)
      .set(authHeader);
    expect(balanceResponse.status).toBe(200);
    expect(balanceResponse.body.balance).toBe(0);
  });
});

// Helper function to create a test expense in a group
async function createTestExpense(testContext: TestContext) {
  const { app, authHeader, groupId, categoryId, userA, userB, userC } = testContext;
  
  const response = await request(app.getHttpServer())
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

  expect(response.status).toBe(201);
  return response.body;
}

// Helper function to create a test expense outside a group
async function createNonGroupExpense(testContext: TestContext) {
  const { app, authHeader, categoryId, userA, userB } = testContext;
  
  const response = await request(app.getHttpServer())
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

  expect(response.status).toBe(201);
  return response.body;
} 