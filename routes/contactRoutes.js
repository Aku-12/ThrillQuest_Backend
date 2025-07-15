const express = require("express");
const { authenticateUser, isAdmin } = require("../middlewares/authorizedUser");
const { submitContact, getAllContacts } = require("../controllers/contactController");
const router = express.Router();

router.post("/create", authenticateUser, submitContact);
router.get("/get", authenticateUser, isAdmin, getAllContacts);

module.exports = router;
