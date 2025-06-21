const express = require("express");
require("dotenv").config();
const authRoute = require("./routes/authRoute");
const cors = require("cors");
const adminUserRoute = require("./routes/admin/adminUserRoute");
const adminActivitiesRoute = require("./routes/admin/adminActivitiesRoute")
const connectDatabase = require("./config/database");
const path = require("path")

const corsOrigin = {
  origin: "*",
};

connectDatabase();

const app = express();

app.use(cors(corsOrigin));
app.use(express.json());

// Serve uploaded images statically
app.use("/uploads", express.static(path.join(__dirname, "uploads")))

app.use("/api/auth", authRoute);
app.use("/api/admin", adminUserRoute);
app.use("/api/admin/activities", adminActivitiesRoute);
//  // <-- Mount activities route

const PORT = process.env.PORT ;

app.listen(PORT, () => {
  console.log(`Server running at port ${PORT}`);
});
