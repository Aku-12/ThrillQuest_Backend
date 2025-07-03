const mongoose = require("mongoose");

const activitySchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  location: {
    type: String,
    required: true,
  },
  images: {
    type: [String],
    required: true,
  },
  price: {
    type: Number,
    required: true,
  },
  duration: {
    type: String,
    required: true,
  },
  difficulty: {
    type: String,
    enum: ["Beginner", "Intermediate", "Advanced"],
    required: true,
  },
  bookings: {
    type: Number,
    default: 0,
  },
  rating: {
    type: Number,
    default: 0,
  },
  status: {
    type: String,
    enum: ["Active", "On Hold"],
    default: "Active",
  },
});

module.exports = mongoose.model("Activity", activitySchema);
