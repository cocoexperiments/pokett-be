import { Test, TestingModule } from "@nestjs/testing";
import { INestApplication, ValidationPipe } from "@nestjs/common";
import { AppModule } from "../../../src/app.module";
import { Connection } from "mongoose";
import { getConnectionToken } from "@nestjs/mongoose";
import * as request from "supertest";
import { authenticateUser, getAuthHeader } from "./auth.helper";
import { initFactories } from "./factories/init-factories";
import "../../test-config"; // This will load and validate test environment

export interface TestContext {
  app: INestApplication;
  connection: Connection;
  userA: any;
  userB: any;
  userC: any;
  groupId: string;
  categoryId: string;
  authHeader: { Authorization: string };
}

export async function setupTestApp(): Promise<{ app: INestApplication; connection: Connection }> {
  const moduleFixture: TestingModule = await Test.createTestingModule({
    imports: [AppModule],
  }).compile();

  const app = moduleFixture.createNestApplication();

  // Configure app the same way as in main.ts
  app.setGlobalPrefix("api");
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
    })
  );

  const connection = moduleFixture.get<Connection>(getConnectionToken());
  
  // Initialize factories
  initFactories(connection);
  
  await app.init();

  return { app, connection };
}

export async function cleanupTestApp(app: INestApplication, connection: Connection): Promise<void> {
  try {
    await app.close();
    await connection.close();
  } catch (error) {
    console.error('Error during cleanup:', error);
    throw error;
  }
}

export async function setupTestUsers(app: INestApplication): Promise<{
  userA: any;
  userB: any;
  userC: any;
  authHeader: { Authorization: string };
}> {
  // Create fresh users
  const userAResponse = await authenticateUser(app);
  const userBResponse = await authenticateUser(app);
  const userCResponse = await authenticateUser(app);
  
  const userA = userAResponse.user;
  const userB = userBResponse.user;
  const userC = userCResponse.user;
  
  // Get auth header for the first user
  const authHeader = { Authorization: `Bearer ${userAResponse.session_token}` };

  return { userA, userB, userC, authHeader };
}

export async function setupTestGroup(
  app: INestApplication,
  authHeader: { Authorization: string },
  userA: any,
  userB: any,
  userC: any
): Promise<string> {
  // Create a group with all three users
  const createGroupResponse = await request(app.getHttpServer())
    .post("/api/groups")
    .set(authHeader)
    .send({
      name: "Test Group",
      members: [userA._id, userB._id, userC._id],
      createdBy: userA._id,
    });
  
  return createGroupResponse.body._id;
}

export async function setupTestCategory(
  app: INestApplication,
  authHeader: { Authorization: string }
): Promise<string> {
  const createCategoryResponse = await request(app.getHttpServer())
    .post("/api/categories")
    .set(authHeader)
    .send({
      name: "Food",
      icon: "food-icon",
      color: "#FF5733"
    });
  
  return createCategoryResponse.body._id;
}

export async function setupTestContext(): Promise<TestContext> {
  const { app, connection } = await setupTestApp();
  
  try {
    const { userA, userB, userC, authHeader } = await setupTestUsers(app);
    const groupId = await setupTestGroup(app, authHeader, userA, userB, userC);
    const categoryId = await setupTestCategory(app, authHeader);

    return {
      app,
      connection,
      userA,
      userB,
      userC,
      groupId,
      categoryId,
      authHeader
    };
  } catch (error) {
    // If anything fails during setup, clean up
    await cleanupTestApp(app, connection);
    throw error;
  }
} 