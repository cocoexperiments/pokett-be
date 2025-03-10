import * as request from "supertest";
import { setupTestApp, setupTestUsers } from "../helpers/test-setup.helper";
import { INestApplication } from "@nestjs/common";
import { Connection } from "mongoose";

describe("Group Management (e2e)", () => {
  let app: INestApplication;
  let connection: Connection;
  let authHeader: { Authorization: string };
  let userA: any;
  let userB: any;
  let userC: any;

  beforeAll(async () => {
    const setup = await setupTestApp();
    app = setup.app;
    connection = setup.connection;
  });

  beforeEach(async () => {
    // Clean up the database before each test
    await connection.dropDatabase();
    // Get fresh auth token and users for each test
    const users = await setupTestUsers(app);
    authHeader = users.authHeader;
    userA = users.userA;
    userB = users.userB;
    userC = users.userC;
  });

  afterAll(async () => {
    await connection.dropDatabase();
    await app.close();
  });

  it("Should be able to create a group with multiple users", async () => {
    const createGroupResponse = await request(app.getHttpServer())
      .post("/api/groups")
      .set(authHeader)
      .send({
        name: "Test Group",
        members: [userA._id, userB._id, userC._id],
        createdBy: userA._id,
      });
    
    expect(createGroupResponse.status).toBe(201);
    expect(createGroupResponse.body.name).toBe("Test Group");
    expect(createGroupResponse.body.members).toHaveLength(3);
  });

  it("Should be able to get a group by ID", async () => {
    // Create a group first
    const createGroupResponse = await request(app.getHttpServer())
      .post("/api/groups")
      .set(authHeader)
      .send({
        name: "Get Group Test",
        members: [userA._id, userB._id],
        createdBy: userA._id,
      });
    
    const groupId = createGroupResponse.body._id;
    
    // Get the group by ID
    const getGroupResponse = await request(app.getHttpServer())
      .get(`/api/groups/${groupId}`)
      .set(authHeader);
    
    expect(getGroupResponse.status).toBe(200);
    expect(getGroupResponse.body._id).toBe(groupId);
    expect(getGroupResponse.body.name).toBe("Get Group Test");
    expect(getGroupResponse.body.members).toHaveLength(2);
  });

//   it("Should be able to add a member to an existing group", async () => {
//     // Create a group with two members
//     const createGroupResponse = await request(app.getHttpServer())
//       .post("/api/groups")
//       .set(authHeader)
//       .send({
//         name: "Add Member Test",
//         members: [userA._id, userB._id],
//         createdBy: userA._id,
//       });
    
//     const groupId = createGroupResponse.body._id;
    
//     // Add a third member
//     const updateGroupResponse = await request(app.getHttpServer())
//       .patch(`/api/groups/${groupId}/members`)
//       .set(authHeader)
//       .send({
//         members: [userA._id, userB._id, userC._id],
//       });
    
//     expect(updateGroupResponse.status).toBe(200);
//     expect(updateGroupResponse.body.members).toHaveLength(3);
//   });
}); 