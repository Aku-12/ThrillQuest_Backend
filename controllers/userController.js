const User = require('../models/userModel')
const bcryptjs = require('bcryptjs')

const jwt = require('jsonwebtoken')

const createAccount = async(req, res) => {
    try {
        const { fName, lName, email, phoneNo, role, password } = req.body;
        const existingUser = await User.findOne({ email })

        if (existingUser) return res.status(403).json({
            success: false,
            message: 'Account already exists with this email! Try logging in..'
        })

        const hashedPassword = await bcryptjs.hash(password, 10)

        const newUser = new User({
            fName,
            lName,
            email,
            phoneNo,
            role,
            password: hashedPassword
        })

        await newUser.save()

        res.status(200).json({
            success: true,
            message: 'Account successfully created!',
            data: {
                newUser
            }
        })
    } catch (error) {
        res.status(400).json({
            success: false,
            message: error.message
        })
    }
}

const login = async(req, res) => {
    try {
        const { email, password } = req.body; // akchaudhary@gmail.com && chaudhary$1 => attached to request body
        const existingUser = await User.findOne({email}) // check if akchaudhary@gmail.com this email exists in database
        // if it does store it in existingUser

        if (!existingUser) return res.status(401).json({
            success: false,
            message: 'Account doesnot exist. Please create one!'
        }) // return if it doesn;t exist

        // Password comparing using bcryptjs... password: chaudhary$1, hashedPassword: existingUser.password
        const isMatch = await bcryptjs.compare(password, existingUser.password)

        if (!isMatch) return res.status(404).json({
            success: false,
            message: "Invalid Credentials"
        })

        // session handling
        const payload = {
            userId: existingUser._id,
            role: existingUser.role,
            email:existingUser.email,
            fName:existingUser.fName
        }

        const token = jwt.sign(payload, process.env.JWT_SECRET, {
            expiresIn:'1h'
        })


        res.status(200).json({
            success: true,
            message: 'Successfully logged in..',
            data: {
                fName: existingUser.fName,
                lName: existingUser.lName,
                role: existingUser.role,
            },
            token
        })
    } catch (error) {
        res.status(500).json({
        message: error.message
        })
    }
}

module.exports = { createAccount, login }