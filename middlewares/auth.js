const jwt = require("jsonwebtoken");
const ErrorHandler = require("../utils/errorHandler");
const User = require("../models/User");

exports.isAuthenticatedUser = async (req, res, next) => {
  try {
    // Extract the token from the Authorization header
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer")) {
      return next(new ErrorHandler("Unauthorized: No token provided", 401));
    }

    const token = authHeader.split(" ")[1];

    const decodedData = jwt.verify(token, process.env.SEC_KEY);

    const user = await User.findById(decodedData.id);
    if (!user) {
      return next(new ErrorHandler("Unauthorized: User not found", 401));
    }

    req.user = user;

    next();
  } catch (error) {
    if (
      error.name === "JsonWebTokenError" ||
      error.name === "TokenExpiredError"
    ) {
      return next(
        new ErrorHandler("Unauthorized: Invalid or expired token", 401)
      );
    }
    return next(new ErrorHandler("Server Error", 500));
  }
};

exports.isAdmin = async (req, res, next) => {
  try {
    // Extract the token from the Authorization header
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer")) {
      return res
        .status(401)
        .json({ isAdmin: false, error: "Unauthorized: No token provided" });
    }

    const token = authHeader.split(" ")[1];

    // Verify the token
    const decodedData = jwt.verify(token, process.env.SEC_KEY);

    // Find the user by ID
    const user = await User.findById(decodedData.id);
    if (!user) {
      return res
        .status(401)
        .json({ isAdmin: false, error: "Unauthorized: User not found" });
    }

    // Set the user in the request object
    req.user = user;

    // Check if the user is an admin
    if (user.isAdmin) {
      return res.status(200).json({ isAdmin: true });
    } else {
      return res.status(403).json({
        isAdmin: false,
        error: "Forbidden: You do not have the required permissions",
      });
    }
  } catch (error) {
    if (
      error.name === "JsonWebTokenError" ||
      error.name === "TokenExpiredError"
    ) {
      return res.status(401).json({
        isAdmin: false,
        error: "Unauthorized: Invalid or expired token",
      });
    }
    return res.status(500).json({ isAdmin: false, error: "Server Error" });
  }
};


exports.authorized = async (req, res, next) => {
  try {
    // Extract the token from the Authorization header
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer")) {
      return res
        .status(401)
        .json({ isAdmin: false, error: "Unauthorized: No token provided" });
    }

    const token = authHeader.split(" ")[1];

    // Verify the token
    const decodedData = jwt.verify(token, process.env.SEC_KEY);

    // Find the user by ID
    const user = await User.findById(decodedData.id);
    if (!user) {
      return res
        .status(401)
        .json({ isAdmin: false, error: "Unauthorized: User not found" });
    }

    // Set the user in the request object
    req.user = user;

    // Check if the user is an admin
    if (user.isAdmin) {
      return next()
    } else {
      return res.status(403).json({
        error: "Forbidden: You do not have the required permissions",
      });
    }
  } catch (error) {
    if (
      error.name === "JsonWebTokenError" ||
      error.name === "TokenExpiredError"
    ) {
      return res.status(401).json({
        error: "Unauthorized: Invalid or expired token",
      });
    }
    return res.status(500).json({error: "Server Error" });
  }
};