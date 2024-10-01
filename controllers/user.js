const crypto = require("crypto");
const sendEmail = require("../utils/sendEmail");
const User = require("../models/User");
const ErrorHandler = require("../utils/errorHandler");
const cryptoJs = require("crypto-js");
const jwt = require("jsonwebtoken");
const ResponseHandler = require("../utils/resHandler");

exports.registerUser = async (req, res, next) => {
  const { firstName, lastName, email, password } = req.body;

  try {
    // Check if the user already exists
    const checkUser = await User.findOne({ email });
    if (checkUser) {
      return next(new ErrorHandler("User already registered", 400));
    }

    // Create a new user object
    const user = new User({
      firstName,
      lastName,
      email,
      password: cryptoJs.AES.encrypt(password, process.env.SEC_KEY).toString(),
    });

    // Generate a verification token and its expiration time
    const verificationToken = crypto.randomBytes(32).toString("hex");
    const expireTime = Date.now() + 15 * 60 * 1000;
    user.verificationToken = crypto
      .createHash("sha256")
      .update(verificationToken)
      .digest("hex");
    user.verificationTokenExpire = expireTime;

    // Set verification context
    user.verificationContext = 'signup';

    // Save the user object
    await user.save();

    // Create a verification link
    const verificationLink = `${process.env.FRONTEND_URL}/verify-email?token=${verificationToken}&type=signup`;

    // Create the email message
    const message = `Your email verification link is: \n\n ${verificationLink} \n\n This link will expire in 15 minutes. \n\n If you did not request this email, please ignore it.`;

    // Send verification email
    await sendEmail({
      email: user.email,
      subject: "Edge Dynasty Email Verification",
      message,
    });

    // Respond with success
    res.status(201).json({
      success: true,
      message: `Verification link has been sent to ${user.email} successfully`,
    });
  } catch (error) {
    return next(new ErrorHandler(error.message, 500));
  }
};


exports.verifyEmail = async (req, res, next) => {
  const { token, type } = req.query;

  if (!token || !type) {
    return next(new ErrorHandler("Invalid or expired token", 400));
  }

  const hashedToken = crypto.createHash("sha256").update(token).digest("hex");

  const user = await User.findOne({
    verificationToken: hashedToken,
    verificationTokenExpire: { $gt: Date.now() },
  });

  if (!user) {
    return next(new ErrorHandler("Invalid or expired token", 400));
  }

  user.isVerified = true;
  user.verificationToken = undefined;
  user.verificationTokenExpire = undefined;

  await user.save();

  res.status(200).json({
    success: true,
    message: "Email verified successfully",
    userId: user._id // Return user ID
  });
};


exports.loginUser = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });

    if (!user) {
      return next(new ErrorHandler("Invalid email or password", 401));
    }

    const decryptedPassword = cryptoJs.AES.decrypt(
      user.password,
      process.env.SEC_KEY
    ).toString(cryptoJs.enc.Utf8);

    if (decryptedPassword !== password) {
      return next(new ErrorHandler("Invalid email or password", 401));
    }

    if (!user.isVerified) {
      const verificationToken = crypto.randomBytes(32).toString("hex");
      const expireTime = Date.now() + 15 * 60 * 1000; // 15 minutes from now
      user.verificationToken = crypto
        .createHash("sha256")
        .update(verificationToken)
        .digest("hex");
      user.verificationTokenExpire = expireTime;
      verificationContext = 'signup'

      await user.save();

      const verificationLink = `${process.env.FRONTEND_URL}/verify-email?token=${verificationToken}`;

      const message = `Your email verification link is: \n\n ${verificationLink} \n\n This link will expire in 15 minutes. \n\n If you did not request this email, please ignore it.`;

      await sendEmail({
        email: user.email,
        subject: "Edge Dynasty Email Verification - Resend",
        message,
      });

      return next(
        new ErrorHandler(
          "Email not verified. Verification link resent to your email.",
          401
        )
      );
    }

    const token = jwt.sign({ id: user._id }, process.env.SEC_KEY, {
      expiresIn: process.env.JWT_EXPIRES_TIME,
    });

    return new ResponseHandler(res, 200, true, "Login successful", {
      id: user._id,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      isAdmin: user.isAdmin,
      token,
    });
  } catch (error) {
    return next(new ErrorHandler(error.message, 500));
  }
};

exports.ForgotPassword = async (req, res, next) => {
  try {
    const email = req.body.email;
    const checkUser = await User.findOne({ email });
    if (!checkUser) {
      return next(new ErrorHandler("User not Found", 404));
    }

    const verificationToken = crypto.randomBytes(32).toString("hex");
    const expireTime = Date.now() + 15 * 60 * 1000; // 15 minutes from now
    checkUser.verificationToken = crypto
      .createHash("sha256")
      .update(verificationToken)
      .digest("hex");
    checkUser.verificationTokenExpire = expireTime;
    checkUser.verificationContext = 'forgot-password';

    const verificationLink = `${process.env.FRONTEND_URL}/verify-email?token=${verificationToken}&type=forgot-password`;
    const message = `Your email verification link is: \n\n ${verificationLink} \n\n This link will expire in 15 minutes. \n\n If you did not request this email, please ignore it.`;
    await sendEmail({
      email: checkUser.email,
      subject: "Edge Dynasty Email Verification",
      message,
    });

    await checkUser.save()
    return new ResponseHandler(
      res,
      200,
      true,
      "Verication user send check your email",
      {}
    );
  } catch (error) {
    return next(new ErrorHandler(error.message, 500));
  }
};


exports.verifyResetEmail = async (req, res, next) => {
  const { token, type } = req.query;

  if (!token || !type) {
    return next(new ErrorHandler("Invalid or expired token", 400));
  }

  const hashedToken = crypto.createHash("sha256").update(token).digest("hex");

  const user = await User.findOne({
    verificationToken: hashedToken,
    verificationTokenExpire: { $gt: Date.now() },
  });

  if (!user) {
    return next(new ErrorHandler("Invalid or expired token", 400));
  }

  user.resetPassVerified = true;
  user.verificationToken = undefined;
  user.verificationTokenExpire = undefined;

  await user.save();

  res.status(200).json({
    success: true,
    message: "Email verified successfully",
    userId: user._id // Return user ID
  });
};


exports.resetPassword = async (req, res, next) => {
  const { password } = req.body;

  try {
    // Find user by ID from the request parameters
    const user = await User.findById(req.params.id);

    if (!user) {
      return next(new ErrorHandler("User not Found", 404));
    }

    if(user.resetPassVerified === false){
      return next(new ErrorHandler("Verify your email first", 400));
    }

    // Encrypt the new password and update user record
    user.password = cryptoJs.AES.encrypt(password, process.env.SEC_KEY).toString();

    await user.save(); // Ensure to await this operation

    return new ResponseHandler(
      res,
      200,
      true,
      "Password updated successfully",
      {}
    );

  } catch (error) {
    return next(new ErrorHandler(error.message, 500));
  }
}


exports.getUser = async (req, res, next)=>{
  try {
    const user = await User.findById(req.user._id);

    if(!user){
      return next(new ErrorHandler("User not found", 404));
    }

    return new ResponseHandler(res, 200, true, "", user)
  } catch (error) {
    return next(new ErrorHandler(error.message, 500));
  }
}
