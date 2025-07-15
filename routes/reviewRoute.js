const express = require("express");
const { createReview, getActivityReviews, getAllReviews, updateReviewStatus, deleteReview } = require("../controllers/reviewController");
const { authenticateUser, isAdmin } = require("../middlewares/authorizedUser");
const router = express.Router()

router.post("/create", authenticateUser, createReview);
router.get("/:activityId", getActivityReviews);

router.get("/", authenticateUser, getAllReviews);
router.patch("/:id", authenticateUser, isAdmin, updateReviewStatus);
router.delete("/:id", authenticateUser, isAdmin, deleteReview);

module.exports = router;