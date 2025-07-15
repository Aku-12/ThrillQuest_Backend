// controllers/reviewController.js
const Activity = require("../models/activityModel");
const Review = require("../models/reviewModel");
const Booking = require("../models/bookingsModel");

exports.createReview = async (req, res) => {
  try {
    const { activityId, rating, comment } = req.body;
    const userId = req.user._id;
    const userName = `${req.user.fName} ${req.user.lName}`;

    const booking = await Booking.findOne({ activity: activityId, customerName: userName });
    if (!booking) {
      return res.status(403).json({ success: false, message: "You can only review an activity you have booked." });
    }

    const existingReview = await Review.findOne({ activity: activityId, userId });
    if (existingReview) {
      return res.status(400).json({ success: false, message: "You have already reviewed this activity." });
    }

    const newReview = await Review.create({ activity: activityId, userId, userName, rating, comment });

    const reviews = await Review.find({ activity: activityId });
    const avgRating = reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length;

    await Activity.findByIdAndUpdate(activityId, { rating: avgRating });

    res.status(201).json({
      success: true,
      message: "Review submitted and rating updated.",
      data: newReview,
    });
  } catch (error) {
    console.error("Review error:", error);
    res.status(500).json({ success: false, message: "Server error." });
  }
};

exports.getActivityReviews = async (req, res) => {
  try {
    const { activityId } = req.params;
    const reviews = await Review.find({ activity: activityId }).sort({ createdAt: -1 });
    res.json({ success: true, data: reviews });
  } catch (error) {
    console.error("Get reviews error:", error);
    res.status(500).json({ success: false, message: "Server error." });
  }
};

// Admin: Get All Reviews
exports.getAllReviews = async (req, res) => {
  try {
    const reviews = await Review.find().populate("activity").sort({ createdAt: -1 });
    res.json({ success: true, data: reviews });
  } catch (error) {
    console.error("Get all reviews error:", error);
    res.status(500).json({ success: false, message: "Server error." });
  }
};

// Admin: Update Review Status
exports.updateReviewStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    const review = await Review.findByIdAndUpdate(id, { status }, { new: true });
    res.json({ success: true, message: "Review status updated", data: review });
  } catch (error) {
    console.error("Update review error:", error);
    res.status(500).json({ success: false, message: "Server error." });
  }
};

// Admin: Delete Review
exports.deleteReview = async (req, res) => {
  try {
    const { id } = req.params;
    await Review.findByIdAndDelete(id);
    res.json({ success: true, message: "Review deleted" });
  } catch (error) {
    console.error("Delete review error:", error);
    res.status(500).json({ success: false, message: "Server error." });
  }
};
