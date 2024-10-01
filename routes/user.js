const User = require("../models/User");
const ResponseHandler = require("../utils/resHandler");
const ErrorHandler = require("../utils/errorHandler");
const {
  loginUser,
  registerUser,
  verifyEmail,
  ForgotPassword,
  resetPassword,
  verifyResetEmail,
  getUser,
} = require("../controllers/user");
const { isAuthenticatedUser, isAdmin } = require("../middlewares/auth");

const router = require("express").Router();

router.post("/login", loginUser);
router.post("/register", registerUser);
router.get("/verify-email", verifyEmail);
router.get("/verify-reset-email", verifyResetEmail);
router.get("/verify/login", isAuthenticatedUser);
router.get("/verify/admin", isAdmin);
router.post("/forgot/password", ForgotPassword);
router.post("/reset/password/:id", resetPassword);
router.get("/get", isAuthenticatedUser, getUser);

module.exports = router;
