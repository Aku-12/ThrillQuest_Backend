const express = require("express");
const {
  createGuide,
  getGuides,
  getGuideById,
  updateGuide,
  deleteGuide,
  rateGuide
} = require("../../controllers/admin/guidesController");
const {
  authenticateUser,
  isAdmin,
} = require("../../middlewares/authorizedUser");

const router = express.Router();

// CREATE Guide
router.post("/", authenticateUser, isAdmin, createGuide);

// GET All Guides with Search, Filter, Pagination
router.get("/", getGuides);

// GET Single Guide by ID
router.get("/:id", authenticateUser, getGuideById);

// UPDATE Guide
router.put("/:id", authenticateUser, isAdmin, updateGuide);

// DELETE Guide
router.delete("/:id", authenticateUser, isAdmin, deleteGuide);

router.post("/:id/rate", authenticateUser, rateGuide);

module.exports = router;
