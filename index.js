const express = require('express')
require('dotenv').config()
const authRoute = require("./routes/authRoute")
const cors = require('cors')

const connectDatabase = require('./config/database')

const corsOrigin = {
  origin: "*"
}

connectDatabase()

const app = express()

app.use(cors(corsOrigin))

app.use(express.json())

app.use('/api/auth', authRoute )

const PORT = process.env.PORT

app.listen(PORT, ()=> {
  console.log(`Server running at port ${PORT}`)
})