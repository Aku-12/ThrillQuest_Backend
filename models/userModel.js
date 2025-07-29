const mongoose = require('mongoose')

const userModel = mongoose.Schema({
    fName: {
        type: String,
        required: true,
    },
    lName: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true,
        unique: true
    }, 
    phoneNo: {
        type: String,
        required: true,
    },
    role:{
        type: String,
        enum: ["customer", "admin"],
        default: "customer"
    },
    password: {
        type: String,
        required: true
    },
    profileImage: {
        type: String,
        default: ""
    }
})

module.exports = mongoose.model('User', userModel)