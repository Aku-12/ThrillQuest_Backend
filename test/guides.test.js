// test/guides.test.js
const request = require("supertest");
const mongoose = require("mongoose");
const { MongoMemoryServer } = require("mongodb-memory-server");
const jwt = require("jsonwebtoken");

let mongoServer;
const app = require("../app"); 

const User = require("../models/userModel");
const Guide = require("../models/guidesmodel");

let adminToken, userToken, guideId;

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  const uri = mongoServer.getUri();

  // Ensure fresh connection
  if (mongoose.connection.readyState !== 0) {
    await mongoose.disconnect();
  }
  await mongoose.connect(uri);

  process.env.JWT_SECRET = "testsecret";

  // create users
  const admin = await User.create({
    fName: "Admin",
    lName: "Test",
    email: "admin@xyz.com",
    phoneNo: "1234567890",
    role: "admin",
    password: "Admin123",
  });
  const user = await User.create({
    fName: "Normal",
    lName: "User",
    email: "user@xyz.com",
    phoneNo: "0987654321",
    role: "customer",
    password: "User123",
  });

  // generate tokens using same payload used by authenticateUser
  adminToken = jwt.sign(
    { userId: admin._id, role: "admin", email: admin.email, fName: admin.fName },
    process.env.JWT_SECRET
  );
  userToken = jwt.sign(
    { userId: user._id, role: "customer", email: user.email, fName: user.fName },
    process.env.JWT_SECRET
  );
});

afterAll(async () => {
  await mongoose.connection.dropDatabase();
  await mongoose.connection.close();
  await mongoServer.stop();
});

describe("Guide API", () => {
  it("should allow admin to create a guide", async () => {
    const res = await request(app)
      .post("/api/admin/guides")
      .set("Authorization", `Bearer ${adminToken}`)
      .send({
        name: "Alex Guide",
        email: "alex@guide.com",
        specialties: ["Hiking", "Rafting"],
        experience: 5,
        assignedTours: 2,
        status: "Available",
      });
    expect(res.statusCode).toBe(201);
    expect(res.body.success).toBe(true);
    guideId = res.body.guide._id;
  });

  it("should forbid non-admin from creating a guide", async () => {
    const res = await request(app)
      .post("/api/admin/guides")
      .set("Authorization", `Bearer ${userToken}`)
      .send({ name: "NotAllowed", email: "na@no.com", experience: 3 });
    expect(res.statusCode).toBe(403);
  });

  it("should let authenticated users fetch all guides", async () => {
    const res = await request(app)
      .get("/api/admin/guides")
      .set("Authorization", `Bearer ${userToken}`);
    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body.data)).toBe(true);
    expect(res.body.data.length).toBe(1);
  });

  it("should let authenticated users fetch a guide by ID", async () => {
    const res = await request(app)
      .get(`/api/admin/guides/${guideId}`)
      .set("Authorization", `Bearer ${userToken}`);
    expect(res.statusCode).toBe(200);
    expect(res.body.data._id).toBe(guideId);
  });

  it("should allow admin to update guide", async () => {
    const res = await request(app)
      .put(`/api/admin/guides/${guideId}`)
      .set("Authorization", `Bearer ${adminToken}`)
      .send({ name: "Updated Guide Name" });
    expect(res.statusCode).toBe(200);
    expect(res.body.guide.name).toBe("Updated Guide Name");
  });

  it("should forbid non-admin from updating guide", async () => {
    const res = await request(app)
      .put(`/api/admin/guides/${guideId}`)
      .set("Authorization", `Bearer ${userToken}`)
      .send({ name: "Illegal Update" });
    expect(res.statusCode).toBe(403);
  });

  it("should allow authenticated user to rate a guide", async () => {
    const res = await request(app)
      .post(`/api/admin/guides/${guideId}/rate`)
      .set("Authorization", `Bearer ${userToken}`)
      .send({ rating: 4 });
    expect(res.statusCode).toBe(200);
    expect(res.body.averageRating).toBe(4);
  });

  it("should reject invalid rating value", async () => {
    const res = await request(app)
      .post(`/api/admin/guides/${guideId}/rate`)
      .set("Authorization", `Bearer ${userToken}`)
      .send({ rating: 10 });
    expect(res.statusCode).toBe(400);
  });

  it("should allow admin to delete a guide", async () => {
    const res = await request(app)
      .delete(`/api/admin/guides/${guideId}`)
      .set("Authorization", `Bearer ${adminToken}`);
    expect(res.statusCode).toBe(200);
    expect(res.body.message.toLowerCase()).toContain("deleted");
  });

  it("should forbid non-admin from deleting a guide", async () => {
    const g = await Guide.create({
      name: "Temp",
      email: "temp@g.com",
      specialties: [],
      experience: 1,
      assignedTours: 0,
      status: "Available",
    });
    const res = await request(app)
      .delete(`/api/admin/guides/${g._id}`)
      .set("Authorization", `Bearer ${userToken}`);
    expect(res.statusCode).toBe(403);
  });
});
