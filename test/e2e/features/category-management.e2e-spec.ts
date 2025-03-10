import * as request from "supertest";
import { setupTestApp, setupTestUsers } from "../helpers/test-setup.helper";
import { INestApplication } from "@nestjs/common";
import { Connection } from "mongoose";

interface Category {
  _id: string;
  name: string;
  icon?: string;
  color?: string;
}

describe("Category Management (e2e)", () => {
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

  it("Should be able to create a category", async () => {
    const createCategoryResponse = await request(app.getHttpServer())
      .post("/api/categories")
      .set(authHeader)
      .send({
        name: "Food",
        icon: "food-icon",
        color: "#FF5733"
      });
    
    expect(createCategoryResponse.status).toBe(201);
    expect(createCategoryResponse.body.name).toBe("Food");
    expect(createCategoryResponse.body.icon).toBe("food-icon");
    expect(createCategoryResponse.body.color).toBe("#FF5733");
  });

  it("Should be able to get all categories", async () => {
    // Create a few categories first
    await request(app.getHttpServer())
      .post("/api/categories")
      .set(authHeader)
      .send({
        name: "Food",
        icon: "food-icon",
        color: "#FF5733"
      });
      
    await request(app.getHttpServer())
      .post("/api/categories")
      .set(authHeader)
      .send({
        name: "Entertainment",
        icon: "entertainment-icon",
        color: "#33FF57"
      });
    
    // Get all categories
    const getCategoriesResponse = await request(app.getHttpServer())
      .get("/api/categories")
      .set(authHeader);
    
    expect(getCategoriesResponse.status).toBe(200);
    expect(getCategoriesResponse.body.length).toBeGreaterThanOrEqual(2);
    
    // Check if our categories are in the response
    const categoryNames = getCategoriesResponse.body.map((cat: Category) => cat.name);
    expect(categoryNames).toContain("Food");
    expect(categoryNames).toContain("Entertainment");
  });

  it("Should be able to get a category by ID", async () => {
    // Create a category first
    const createCategoryResponse = await request(app.getHttpServer())
      .post("/api/categories")
      .set(authHeader)
      .send({
        name: "Travel",
        icon: "travel-icon",
        color: "#5733FF"
      });
    
    const categoryId = createCategoryResponse.body._id;
    
    // Get the category by ID
    const getCategoryResponse = await request(app.getHttpServer())
      .get(`/api/categories/${categoryId}`)
      .set(authHeader);
    
    expect(getCategoryResponse.status).toBe(200);
    expect(getCategoryResponse.body._id).toBe(categoryId);
    expect(getCategoryResponse.body.name).toBe("Travel");
  });
}); 