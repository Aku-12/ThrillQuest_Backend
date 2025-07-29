const express = require('express');
const router = express.Router();

// Import controller functions
const {  
    getUserProfile, 
    changePassword, 
    updateUserProfile 
} = require('../controllers/userController');

// Import middlewares
const { authenticateUser } = require('../middlewares/authorizedUser');
const { single } = require('../middlewares/fileUpload'); // Correctly import the single upload middleware

router.get("/fetch", authenticateUser, getUserProfile);

router.put('/update/:userId', single('profileImage'), updateUserProfile);

router.put("/change-password", authenticateUser, changePassword);

module.exports = router;