const request = require("supertest");
const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");
const { MongoMemoryServer } = require("mongodb-memory-server");

const app = require("../app"); // make sure your Express app is exported properly
const User = require("../models/userModel");
const Contact = require("../models/contactModel");

let mongoServer;
let userToken;
let adminToken;

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  const uri = mongoServer.getUri();

  await mongoose.disconnect();
  await mongoose.connect(uri);

  process.env.JWT_SECRET = "testsecret";

  // Create regular user
  const user = await User.create({
    fName: "User",
    lName: "Test",
    email: "user@example.com",
    phoneNo: "9999999999",
    role: "customer",
    password: "Password123",
  });

  userToken = jwt.sign(
    {
      userId: user._id,
      email: user.email,
      role: user.role,
      fName: user.fName,
    },
    process.env.JWT_SECRET
  );

  // Create admin user
  const admin = await User.create({
    fName: "Admin",
    lName: "User",
    email: "admin@example.com",
    phoneNo: "8888888888",
    role: "admin",
    password: "AdminPass123",
  });

  adminToken = jwt.sign(
    {
      userId: admin._id,
      email: admin.email,
      role: admin.role,
      fName: admin.fName,
    },
    process.env.JWT_SECRET
  );
});

afterAll(async () => {
  await mongoose.connection.dropDatabase();
  await mongoose.connection.close();
  await mongoServer.stop();
});

describe("📨 Contact API Tests", () => {
  it("should allow a logged-in user to submit a contact message", async () => {
    const res = await request(app)
      .post("/api/contact/create")
      .set("Authorization", `Bearer ${userToken}`)
      .send({
        name: "John Doe",
        email: "john@example.com",
        phone: "1234567890",
        subject: "Test Subject",
        message: "This is a test message.",
      });

    expect(res.statusCode).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.email).toBe("john@example.com");
  });

  it("should return 400 if required fields are missing", async () => {
    const res = await request(app)
      .post("/api/contact/create")
      .set("Authorization", `Bearer ${userToken}`)
      .send({
        name: "",
        email: "",
        message: "",
      });

    expect(res.statusCode).toBe(400);
    expect(res.body.success).toBe(false);
  });

  it("should allow an admin to fetch all contact messages", async () => {
    const res = await request(app)
      .get("/api/contact/get")
      .set("Authorization", `Bearer ${adminToken}`);

    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(Array.isArray(res.body.data)).toBe(true);
  });

  it("should forbid non-admin users from fetching contacts", async () => {
    const res = await request(app)
      .get("/api/contact/get")
      .set("Authorization", `Bearer ${userToken}`);

    expect(res.statusCode).toBe(403);
    expect(res.body.success).toBe(false);
  });
});
