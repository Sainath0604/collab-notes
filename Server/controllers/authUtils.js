const jwt = require("jsonwebtoken");
const User = require("../models/User");

const authenticateToken = async (req) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    throw { status: 401, message: "No token provided" };
  }

  const token = authHeader.split(" ")[1];
  if (!token) {
    throw { status: 401, message: "Invalid token format" };
  }

  let decoded;
  try {
    decoded = jwt.verify(token, process.env.JWT_SECRET);
  } catch (err) {
    throw { status: 401, message: "Invalid or expired token" };
  }

  const user = await User.findById(decoded.id);
  if (!user) {
    throw { status: 401, message: "User not found for token" };
  }

  return user; // return the user object to get user info
};

module.exports = {
  authenticateToken,
};
