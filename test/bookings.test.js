const request = require("supertest");
const mongoose = require("mongoose");
const { MongoMemoryServer } = require("mongodb-memory-server");
const jwt = require("jsonwebtoken");

const app = require("../app");
const Booking = require("../models/bookingsModel");
const User = require("../models/userModel");
const Activity = require("../models/activityModel");

let mongoServer;
let adminToken;
let userToken;
let adminUser;
let normalUser;

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  const uri = mongoServer.getUri();

  if (mongoose.connection.readyState !== 0) {
    await mongoose.disconnect();
  }
  await mongoose.connect(uri);
});

beforeEach(async () => {
  await Booking.deleteMany();
  await User.deleteMany();
  await Activity.deleteMany();

  // Create admin user
  adminUser = await User.create({
    fName: "Admin",
    lName: "User",
    email: "admin@example.com",
    phoneNo: "9800000000",
    role: "admin", // must be allowed in your User schema enum
    password: "hashedpassword",
  });

  // Create normal user
  normalUser = await User.create({
    fName: "Normal",
    lName: "User",
    email: "user@example.com",
    phoneNo: "9811111111",
    role: "customer", // must be allowed in your User schema enum
    password: "hashedpassword",
  });

  // Generate JWT tokens
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

  userToken = jwt.sign(
    {
      userId: normalUser._id,
      role: normalUser.role,
      email: normalUser.email,
      fName: normalUser.fName,
    },
    process.env.JWT_SECRET || "testsecret",
    { expiresIn: "1h" }
  );
});

afterAll(async () => {
  await mongoose.connection.close();
  await mongoServer.stop();
});

describe("Bookings API", () => {
  let sampleActivity;

  beforeEach(async () => {
    // Create a sample activity to reference in bookings
    sampleActivity = await Activity.create({
      name: "Paragliding",
      location: "Pokhara",
      price: 150,
      duration: "2 hours",
      difficulty: "Intermediate",
      bookings: 5,
      rating: 4.5,
      status: "Active",
    });
  });

  it("should create a booking for authenticated user", async () => {
    const res = await request(app)
      .post("/api/admin/bookings/create")
      .set("Authorization", `Bearer ${userToken}`)
      .send({
        activityId: sampleActivity._id,
        customerName: "John Doe",
        guideName: "Guide One",
        tourDate: "2025-12-31",
      });

    expect(res.statusCode).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.booking.customerName).toBe("John Doe");
    expect(res.body.booking.activity).toBe(String(sampleActivity._id));
  });

  it("should fail to create booking without required fields", async () => {
    const res = await request(app)
      .post("/api/admin/bookings/create")
      .set("Authorization", `Bearer ${userToken}`)
      .send({});

    expect(res.statusCode).toBe(400);
    expect(res.body.success).toBe(false);
    expect(res.body.message).toMatch(/missing required fields/i);
  });

  it("should get all bookings for admin with pagination & filters", async () => {
    // Create a booking to retrieve
    await Booking.create({
      activity: sampleActivity._id,
      customerName: "John Doe",
      guideName: "Guide One",
      tourDate: new Date(),
      userId: normalUser._id,
    });

    const res = await request(app)
      .get("/api/admin/bookings")
      .set("Authorization", `Bearer ${adminToken}`);

    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(Array.isArray(res.body.data)).toBe(true);
    expect(res.body.pagination).toHaveProperty("total");
  });

  it("should forbid normal user to get all bookings", async () => {
    const res = await request(app)
      .get("/api/admin/bookings")
      .set("Authorization", `Bearer ${userToken}`);

    expect(res.statusCode).toBe(403); // Forbidden
    expect(res.body.success).toBe(false);
    expect(res.body.message).toMatch(/admin privilege required/i);
  });

  it("should get bookings of logged-in user", async () => {
    // Create booking for normal user
    await Booking.create({
      activity: sampleActivity._id,
      customerName: "John Doe",
      guideName: "Guide One",
      tourDate: new Date(),
      userId: normalUser._id,
    });

    const res = await request(app)
      .get("/api/admin/bookings/my-bookings")
      .set("Authorization", `Bearer ${userToken}`);

    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(Array.isArray(res.body.data)).toBe(true);
  });

  it("should get booking by ID for admin", async () => {
    const booking = await Booking.create({
      activity: sampleActivity._id,
      customerName: "John Doe",
      guideName: "Guide One",
      tourDate: new Date(),
      userId: normalUser._id,
    });

    const res = await request(app)
      .get(`/api/admin/bookings/${booking._id}`)
      .set("Authorization", `Bearer ${adminToken}`);

    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data._id).toBe(String(booking._id));
  });

  it("should update booking for admin", async () => {
    const booking = await Booking.create({
      activity: sampleActivity._id,
      customerName: "John Doe",
      guideName: "Guide One",
      tourDate: new Date(),
      userId: normalUser._id,
    });

    const res = await request(app)
      .put(`/api/admin/bookings/${booking._id}`)
      .set("Authorization", `Bearer ${adminToken}`)
      .send({
        customerName: "Jane Smith",
        paymentStatus: "Paid",
        bookingStatus: "Confirmed",
      });

    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.booking.customerName).toBe("Jane Smith");
    expect(res.body.booking.paymentStatus).toBe("Paid");
  });

  it("should delete booking for admin", async () => {
    const booking = await Booking.create({
      activity: sampleActivity._id,
      customerName: "John Doe",
      guideName: "Guide One",
      tourDate: new Date(),
      userId: normalUser._id,
    });

    const res = await request(app)
      .delete(`/api/admin/bookings/${booking._id}`)
      .set("Authorization", `Bearer ${adminToken}`);

    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.message).toMatch(/deleted/i);
  });
});
