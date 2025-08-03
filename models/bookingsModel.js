const mongoose = require("mongoose");

const bookingsModel = new mongoose.Schema(
  {
    activity: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Activity",
      required: true,
    },
    customerName: {
      type: String,
      required: true,
    },
    guideName: {
      type: String,
      required: true,
    },
    tourDate: {
      type: Date,
      required: true,
    },
    paymentStatus: {
      type: String,
      enum: ["Paid", "Pending", "Refunded"],
      default: "Pending",
    },
    bookingStatus: {
      type: String,
      enum: ["Confirmed", "Completed", "Canceled"],
      default: "Confirmed",
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Booking", bookingsModel);
