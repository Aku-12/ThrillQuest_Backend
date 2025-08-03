const express = require("express");
const router = express.Router();

// Import controller functions
const {
  getUserProfile,
  changePassword,
  updateUserProfile,
  getMyFavorites,
  addFavoriteBooking,
  removeFavoriteBooking,
} = require("../controllers/userController");

// Import middlewares
const { authenticateUser } = require("../middlewares/authorizedUser");
const { single } = require("../middlewares/fileUpload");

router.get("/fetch", authenticateUser, getUserProfile);

router.put("/update/:userId", single("profileImage"), updateUserProfile);

router.put("/change-password", authenticateUser, changePassword);

router.get("/get-favorites", authenticateUser, getMyFavorites);
router.post("/add-favorite", authenticateUser, addFavoriteBooking);
router.delete(
  "/remove-favorite/:activityId",
  authenticateUser,
  removeFavoriteBooking
);

module.exports = router;
