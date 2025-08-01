const { createAccount, login } = require('../controllers/userController') 

const router = require('express').Router()

router.post('/register', createAccount) 
router.post('/login', login) 

module.exports = router