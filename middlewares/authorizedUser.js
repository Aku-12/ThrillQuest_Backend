const jwt = require("jsonwebtoken");
const User = require("../models/userModel");

exports.authenticateUser = async (req, res, next) => {
  const authHeader = req.headers.authorization;

  try {
    if (!authHeader || !authHeader.startsWith("Bearer")) {
      return res.status(401).json({ success: false, msg: "Access Denied" });
    }

    const token = authHeader.split(" ")[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET || "testsecret");

    const user = await User.findOne({ _id: decoded.userId });

    if (!user) {
      return res.status(401).json({ success: false, message: "Token mismatch" });
    }

    req.user = user;
    next();
  } catch (e) {
    return res.status(500).json({ success: false, msg: "Internal Server token Error" });
  }
};

exports.isAdmin = async (req, res, next) => {
  if (req.user && req.user.role === "admin") {
    next();
  } else {
    return res.status(403).json({ success: false, message: "Admin privilege required" });
  }
};
