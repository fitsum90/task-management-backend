const { describe, it, expect, beforeEach, afterAll } = require("vitest");
const request = require("supertest");
const mongoose = require("mongoose");
const app = require("../server.js");
const Task = require("../models/Task.js");

describe("Task API", () => {
  beforeEach(async () => {
    await Task.deleteMany({});
  });

  afterAll(async () => {
    await mongoose.connection.close();
  });

  it("should create a new task", async () => {
    const response = await request(app)
      .post("/api/tasks")
      .field("title", "Test Task")
      .field("description", "Test Description")
      .attach("file", "test-file.pdf");

    expect(response.status).toBe(201);
    expect(response.body).toHaveProperty("_id");
    expect(response.body.title).toBe("Test Task");
  });

  it("should get all tasks", async () => {
    await Task.create({
      title: "Test Task",
      description: "Test Description",
      status: "TO_DO",
    });

    const response = await request(app).get("/api/tasks");

    expect(response.status).toBe(200);
    expect(Array.isArray(response.body)).toBe(true);
    expect(response.body.length).toBe(1);
  });

  it("should validate task input", async () => {
    const response = await request(app).post("/api/tasks").send({});

    expect(response.status).toBe(400);
  });
});
