const request = require("supertest");
const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");
const { MongoMemoryServer } = require("mongodb-memory-server");

const app = require("../app");

const User = require("../models/userModel");
const Activity = require("../models/activityModel");
const Booking = require("../models/bookingsModel");

let mongoServer;
let userToken;
let activityId;
let userId;
let userFullName;

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  const uri = mongoServer.getUri();

  await mongoose.disconnect();
  await mongoose.connect(uri);

  process.env.JWT_SECRET = "testsecret";

  const user = await User.create({
    fName: "John",
    lName: "Doe",
    email: "john@example.com",
    phoneNo: "1234567890",
    role: "customer",
    password: "Password123",
  });

  userId = user._id;
  userFullName = `${user.fName} ${user.lName}`;

  userToken = jwt.sign(
    {
      userId: user._id,
      role: user.role,
      email: user.email,
      fName: user.fName,
    },
    process.env.JWT_SECRET
  );

  const activity = await Activity.create({
    name: "Hiking Adventure",
    description: "Fun hiking tour",
    price: 100,
    location: "Mountains",
    category: "Outdoor",
    duration: "2 hours", 
    difficulty: "Beginner", 
    bookings: 0,
    rating: 0,
    status: "Active",
  });

  activityId = activity._id;

  await Booking.create({
    activity: activityId,
    customerName: userFullName,
    guideName: "Guide Test",
    tourDate: new Date(),
    paymentStatus: "Paid",
    bookingStatus: "Confirmed",
    userId: userId,
  });
});

afterAll(async () => {
  await mongoose.connection.dropDatabase();
  await mongoose.connection.close();
  await mongoServer.stop();
});

describe("Review API", () => {
  it("should allow user to post a review after booking", async () => {
    const res = await request(app)
      .post("/api/reviews/create")
      .set("Authorization", `Bearer ${userToken}`)
      .send({
        activityId,
        rating: 5,
        comment: "Amazing experience!",
      });

    expect(res.statusCode).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.rating).toBe(5);
    expect(res.body.data.comment).toBe("Amazing experience!");
  });

  it("should prevent posting duplicate reviews", async () => {
    const res = await request(app)
      .post("/api/reviews/create")
      .set("Authorization", `Bearer ${userToken}`)
      .send({
        activityId,
        rating: 4,
        comment: "Trying again",
      });

    expect(res.statusCode).toBe(400);
    expect(res.body.message).toMatch(/already reviewed/i);
  });

  it("should return all reviews for an activity", async () => {
    const res = await request(app).get(`/api/reviews/${activityId}`);
    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body.data)).toBe(true);
    expect(res.body.data.length).toBe(1);
  });

  it("should not allow review if user has no booking", async () => {
    const otherUser = await User.create({
      fName: "Jane",
      lName: "Smith",
      email: "jane@example.com",
      phoneNo: "5551234567",
      role: "customer",
      password: "Password123",
    });

    const otherToken = jwt.sign(
      {
        userId: otherUser._id,
        role: otherUser.role,
        email: otherUser.email,
        fName: otherUser.fName,
      },
      process.env.JWT_SECRET
    );

    const res = await request(app)
      .post("/api/reviews/create")
      .set("Authorization", `Bearer ${otherToken}`)
      .send({
        activityId,
        rating: 3,
        comment: "Didn't book, but trying",
      });

    expect(res.statusCode).toBe(403);
    expect(res.body.message).toMatch(/only review an activity you have booked/i);
  });
});
