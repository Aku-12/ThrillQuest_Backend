const dotenv = require("dotenv");

// Load different env files based on NODE_ENV
dotenv.config({
  path: process.env.NODE_ENV === "test" ? ".env.test" : ".env",
});

const app = require("./app");
const connectDatabase = require("./config/database");

const PORT = process.env.PORT || 5050;

// Only connect DB and listen if NOT in test mode
if (process.env.NODE_ENV !== "test") {
  connectDatabase();
  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://0.0.0.0:${PORT}`);
  });
} else {
  console.log("Test mode: Skipping DB connection and server listen");
}
