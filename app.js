// app.js
const express = require("express");
require("dotenv").config();
const cors = require("cors");
const path = require("path");

const connectDatabase = require("./config/database");

// Import routes
const authRoute = require("./routes/authRoute");
const adminUserRoute = require("./routes/admin/adminUserRoute");
const adminActivitiesRoute = require("./routes/admin/adminActivitiesRoute");
const adminBookingsRoute = require("./routes/admin/adminBookingsRoute");
const adminGuidesRoute = require("./routes/admin/adminGuidesRoute");
const reviewRoute = require("./routes/reviewRoute");
const contactRoutes = require("./routes/contactRoutes");
const profileRoutes = require("./routes/profileRoute");

connectDatabase();

const app = express();

// Middleware
app.use(cors({ origin: "*" }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Static files
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// API routes
app.use("/api/auth", authRoute);
app.use("/api/admin", adminUserRoute);
app.use("/api/admin/activities", adminActivitiesRoute);
app.use("/api/admin/bookings", adminBookingsRoute);
app.use("/api/admin/guides", adminGuidesRoute);
app.use("/api/reviews", reviewRoute);
app.use("/api/contact", contactRoutes);
app.use("/api/profile", profileRoutes);

// Export app (without listen)
module.exports = app;
