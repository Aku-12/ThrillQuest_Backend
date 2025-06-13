const mongoose = require('mongoose')

const connectDatabase = async() => {
    try {
        await mongoose.connect(process.env.MONGODB_URI)
        console.log('Database Connection Successful!')
    } catch(error) {
        console.log(error.message)
    }
}

module.exports = connectDatabase