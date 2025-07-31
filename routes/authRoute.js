const express = require('express');
const router = express.Router();

// Import controller functions
const { 
    createAccount, 
    login, 
} = require('../controllers/userController');

// Import middlewares
const { authenticateUser } = require('../middlewares/authorizedUser');
const { single } = require('../middlewares/fileUpload'); // Correctly import the single upload middleware

router.post('/register', createAccount);

router.post('/login', login);

module.exports = router;