const express = require("express");
const {
  createBooking,
  getBookings,
  getBookingById,
  updateBooking,
  deleteBooking,
  getMyBookings
} = require("../../controllers/admin/bookingsController");
const {
  authenticateUser,
  isAdmin,
} = require("../../middlewares/authorizedUser");

const router = express.Router();      

// Admin: Create Booking
router.post("/create", authenticateUser, createBooking);

// Admin: Get All Bookings (with optional filters/search/pagination)
router.get("/", authenticateUser, isAdmin, getBookings);
router.get("/my-bookings", authenticateUser, getMyBookings);
// Admin: Get Single Booking by ID
router.get("/:id", authenticateUser, isAdmin, getBookingById);

// Admin: Update Booking
router.put("/:id", authenticateUser, isAdmin, updateBooking);

// Admin: Delete Booking
router.delete("/:id", authenticateUser, isAdmin, deleteBooking);

module.exports = router;
