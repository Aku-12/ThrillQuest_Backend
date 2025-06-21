const express = require("express");
const upload = require("../../middlewares/fileUpload")
const {createActivity, getActivity, deleteActivity } = require("../../controllers/admin/activitiesController");
const { authenticateUser, isAdmin } = require("../../middlewares/authorizedUser");

const router = express.Router();

router.post("/", authenticateUser,  upload.single('image'), isAdmin, createActivity)
router.get("/", authenticateUser, isAdmin, getActivity)
// router.update("/:id", updateActivity)
router.delete("/:id", authenticateUser, isAdmin, deleteActivity)

module.exports = router