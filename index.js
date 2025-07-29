require("dotenv").config();
const app = require("./app");
const connectDatabase = require("./config/database");

const PORT = process.env.PORT || 5050;

// Don't connect to real MongoDB if in test mode
if (process.env.NODE_ENV !== "test") {
  connectDatabase();
  app.listen(5050, "0.0.0.0", () => {
    console.log("Server running on http://0.0.0.0:5050");
  });
}
