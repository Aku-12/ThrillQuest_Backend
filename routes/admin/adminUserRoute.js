const express = require("express")
const router = express.Router()
const adminController = require("../../controllers/admin/adminController")
const { isAdmin, authenticateUser } = require("../../middlewares/authorizedUser")

router.get(
    "/getCustomers",
    authenticateUser,
    isAdmin,
    adminController.getAllUsers
)

module.exports = router