const request = require("supertest");
const mongoose = require("mongoose");
const { MongoMemoryServer } = require("mongodb-memory-server");
const jwt = require("jsonwebtoken");

const app = require("../app");
const Activity = require("../models/activityModel");
const User = require("../models/userModel");

let mongoServer;
let adminToken;
let adminUser;

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  const uri = mongoServer.getUri();

  if (mongoose.connection.readyState !== 0) {
    await mongoose.disconnect();
  }

  await mongoose.connect(uri);
});

beforeEach(async () => {
  await Activity.deleteMany();
  await User.deleteMany();

  adminUser = await User.create({
    fName: "Admin",
    lName: "Test",
    email: "admin@example.com",
    phoneNo: "9800000000",
    role: "admin",
    password: "hashedpassword", // won't be validated here
  });

  adminToken = jwt.sign(
    {
      userId: adminUser._id,
      role: adminUser.role,
      email: adminUser.email,
      fName: adminUser.fName,
    },
    process.env.JWT_SECRET || "testsecret",
    { expiresIn: "1h" }
  );
});

afterAll(async () => {
  await mongoose.connection.close();
  await mongoServer.stop();
});

describe("Activity API", () => {
  const sampleActivity = {
    name: "Paragliding",
    location: "Pokhara",
    price: 150,
    duration: "2 hours",
    difficulty: "Intermediate",
    bookings: 5,
    rating: 4.5,
    status: "Active",
  };

  it("should create a new activity (without image upload)", async () => {
    const res = await request(app)
      .post("/api/admin/activities")
      .set("Authorization", `Bearer ${adminToken}`)
      .field("name", sampleActivity.name)
      .field("location", sampleActivity.location)
      .field("price", sampleActivity.price)
      .field("duration", sampleActivity.duration)
      .field("difficulty", sampleActivity.difficulty)
      .field("bookings", sampleActivity.bookings)
      .field("rating", sampleActivity.rating)
      .field("status", sampleActivity.status);

    expect(res.statusCode).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.activity.name).toBe("Paragliding");
  });

  it("should get all activities", async () => {
    await Activity.create(sampleActivity);
    const res = await request(app).get("/api/admin/activities");
    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(Array.isArray(res.body.data)).toBe(true);
  });

  it("should get activity by ID", async () => {
    const activity = await Activity.create(sampleActivity);

    const res = await request(app)
      .get(`/api/admin/activities/${activity._id}`)
      .set("Authorization", `Bearer ${adminToken}`);

    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data._id).toBe(activity._id.toString());
  });

  it("should update an activity", async () => {
    const activity = await Activity.create(sampleActivity);

    const res = await request(app)
      .put(`/api/admin/activities/${activity._id}`)
      .set("Authorization", `Bearer ${adminToken}`)
      .field("name", "Updated Activity")
      .field("location", sampleActivity.location)
      .field("price", sampleActivity.price)
      .field("duration", sampleActivity.duration)
      .field("difficulty", sampleActivity.difficulty)
      .field("bookings", sampleActivity.bookings)
      .field("rating", sampleActivity.rating)
      .field("status", sampleActivity.status)
      .field("existingImages", JSON.stringify([]));

    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.activity.name).toBe("Updated Activity");
  });

  it("should delete an activity", async () => {
    const activity = await Activity.create(sampleActivity);

    const res = await request(app)
      .delete(`/api/admin/activities/${activity._id}`)
      .set("Authorization", `Bearer ${adminToken}`);

    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.message).toMatch(/deleted/i);
  });
});

