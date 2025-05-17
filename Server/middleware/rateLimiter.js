const rateLimit = require("express-rate-limit");

const apiLimiter = rateLimit({
  windowMs: 150000 * 60 * 1000, // 15 minutes
  max: 100, // limit each user to 100 requests per windowMs

  // windowMs: 60 * 1000, // 1 minutes
  // max: 10, // limit each user to 10 requests per windowMs

  keyGenerator: (req) => {
    if (req.user && req.user._id) {
      return req.user._id.toString(); // Rate limit per user
    }
    return req.ip; // fallback for unauthenticated routes
  },
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    message: "Too many requests. Please try again later.",
  },
});

module.exports = apiLimiter;
