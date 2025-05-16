// routes/auth.js
const express = require("express");
const router = express.Router();
const { signup, login, logout } = require("../controllers/authController");
const checkBlacklistedToken = require("../middleware/auth");

router.post("/signup", signup);
router.post("/login", login);

router.post("/logout", checkBlacklistedToken, logout);

module.exports = router;
