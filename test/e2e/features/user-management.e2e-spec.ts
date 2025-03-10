import * as request from "supertest";
import { setupTestApp, setupTestUsers } from "../helpers/test-setup.helper";
import { INestApplication } from "@nestjs/common";
import { Connection } from "mongoose";

describe("User Management (e2e)", () => {
  let app: INestApplication;
  let connection: Connection;
  let authHeader: { Authorization: string };

  beforeAll(async () => {
    const setup = await setupTestApp();
    app = setup.app;
    connection = setup.connection;
  });

  beforeEach(async () => {
    // Clean up the database before each test
    await connection.dropDatabase();
    // Get fresh auth token for each test
    const users = await setupTestUsers(app);
    authHeader = users.authHeader;
  });

  afterAll(async () => {
    await connection.dropDatabase();
    await app.close();
  });

  it("Should be able to create a user with name and email", async () => {
    const createUserResponse = await request(app.getHttpServer())
      .post("/api/users")
      .set(authHeader)
      .send({
        name: "Test User",
        email: "test@example.com",
      });
    
    expect(createUserResponse.status).toBe(201);
    expect(createUserResponse.body.name).toBe("Test User");
    expect(createUserResponse.body.email).toBe("test@example.com");
  });

  it("Should be able to get a user by ID", async () => {
    // Create a user first
    const createUserResponse = await request(app.getHttpServer())
      .post("/api/users")
      .set(authHeader)
      .send({
        name: "Get User Test",
        email: "getuser@example.com",
      });
    
    const userId = createUserResponse.body._id;
    
    // Get the user by ID
    const getUserResponse = await request(app.getHttpServer())
      .get(`/api/users/${userId}`)
      .set(authHeader);
    
    expect(getUserResponse.status).toBe(200);
    expect(getUserResponse.body._id).toBe(userId);
    expect(getUserResponse.body.name).toBe("Get User Test");
  });
}); 