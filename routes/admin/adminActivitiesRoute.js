const express = require("express");
const upload = require("../../middlewares/fileUpload");
const {
  createActivity,
  getActivities,
  getActivityById,
  updateActivity,
  deleteActivity,
} = require("../../controllers/admin/activitiesController");
const {
  authenticateUser,
  isAdmin,
} = require("../../middlewares/authorizedUser");

const router = express.Router();

router.post(
  "/",
  authenticateUser,
  isAdmin,
  upload.array("images", 5),
  createActivity
);

router.get("/", authenticateUser, isAdmin, getActivities);

router.get("/:id", authenticateUser, isAdmin, getActivityById);

router.put(
  "/:id",
  authenticateUser,
  isAdmin,
  upload.array("images", 5),
  updateActivity
);

router.delete("/:id", authenticateUser, isAdmin, deleteActivity);

module.exports = router;
