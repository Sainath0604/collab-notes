const express = require("express");
const router = express.Router();
const {
  signup,
  login,
  logout,
  getUsers,
} = require("../controllers/authController");
const checkBlacklistedToken = require("../middleware/auth");

router.post("/signup", signup);
router.post("/login", login);
router.post("/logout", checkBlacklistedToken, logout);
router.get("/users", getUsers);

module.exports = router;
