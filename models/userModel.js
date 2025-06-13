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
        enum: ["Customer", "Admin"],
        default: "Customer"
    },
    password: {
        type: String,
        required: true
    }
})

