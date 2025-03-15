const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const crypto = require("crypto");
const User = require("../models/userModel");
const sendEmail = require("../utils/email");

const signToken = (id) => {
  const token = jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });
  return token;
};

exports.signup = async (req, res) => {
  console.log("🔹 Signup route was hit!");
  console.log("Received request body:", req.body);

  try {
    const {
      name,
      email,
      password,
      passwordConfirm,
      phone,
      longitude,
      latitude,
      pharmacyName,
      medicines,
    } = req.body;

    if (!passwordConfirm) {
      return res.status(400).json({
        status: "fail",
        message: "Password confirmation is required.",
      });
    }

    if (password !== passwordConfirm) {
      return res.status(400).json({
        status: "fail",
        message: "Passwords do not match.",
      });
    }

    if (longitude == null || latitude == null) {
      return res.status(400).json({
        status: "error",
        message: "Longitude and Latitude must be provided.",
      });
    }

    const long = parseFloat(longitude);
    const lat = parseFloat(latitude);

    if (isNaN(long) || isNaN(lat)) {
      return res.status(400).json({
        status: "error",
        message:
          "Invalid location format. Provide numeric [longitude, latitude].",
      });
    }

    const newUser = await User.create({
      name,
      email,
      password,
      passwordConfirm, // 🔹 Pass it, Mongoose will remove in `pre('save')`
      phone,
      location: {
        type: "Point",
        coordinates: [long, lat],
      },
      pharmacyName: pharmacyName || null,
      medicines: medicines || [],
    });

    const userWithoutPassword = await User.findById(newUser._id).select(
      "-password"
    );

    const token = signToken(newUser._id);

    res.status(201).json({
      status: "success",
      message: "Signed Up successfully",
      token,
      data: {
        user: userWithoutPassword,
      },
    });
  } catch (error) {
    console.error("Signup Error:", error.message);

    if (error.code === 11000) {
      return res.status(400).json({
        status: "error",
        message: "Email or phone number already exists.",
      });
    }

    res.status(400).json({
      status: "fail",
      message: error.message,
    });
  }
};

exports.login = async (req, res, next) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return next(new AppError("Please provide email and password", 400));
  }
  const user = await User.findOne({ email }).select("+password");

  if (!user || !(await user.correctPassword(password, user.password))) {
    return next(new AppError("Incorrect email or password", 401));
  }
  user.password = undefined;
  const token = signToken(user._id);
  res
    .cookie("jwt", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "None",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    })

    .status(200)
    .json({
      status: "Login Successful!",
      token,
      user,
    });
};

exports.logout = (req, res) => {
  res.cookie("jwt", "", {
    expires: new Date(0),
    secure: true,
    sameSite: "None",
    httpOnly: true,
  });
  res.status(200).json({ message: "Logged out successfully" });
};

exports.forgotPassword = async (req, res) => {
  const { email } = req.body;

  if (!email) {
    return res.status(400).json({ error: "Email must be provided" });
  }

  const user = await User.findOne({ email });
  if (!user) {
    return res.status(404).json({ error: "User does not exist" });
  }

  const resetToken = await user.createPasswordResetToken();
  await user.save({ validateBeforeSave: false });

  const resetURL = `${req.protocol}://${req.get(
    "host"
  )}/users/resetPassword/${resetToken}`;
  const message = `Forgot your password? Here is your token valid for only 10 minutes: ${resetToken}.
    Please ignore this email if you didn't request a password reset.`;

  try {
    await sendEmail({
      email: user.email,
      subject: "Password Reset Request",
      message,
    });

    res.status(200).json({
      status: "success",
      message: "Message sent to email",
    });
  } catch (error) {
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save({ validateBeforeSave: false });

    return res
      .status(500)
      .json({ error: "There was an error sending email. Try again later" });
  }
};

exports.resetPassword = async (req, res) => {
  const hashedToken = crypto
    .createHash("sha256")
    .update(req.params.token)
    .digest("hex");

  const user = await User.findOne({
    passwordResetToken: hashedToken,
    passwordResetExpires: { $gt: Date.now() },
  });

  if (!user) {
    return res.status(400).json({ error: "Invalid token or expired" });
  }

  user.password = req.body.password;
  user.passwordConfirm = req.body.passwordConfirm;
  user.passwordResetToken = undefined;
  user.passwordResetExpires = undefined;
  await user.save();

  const token = signToken(user._id);
  res.cookie("jwt", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });

  res.status(200).json({
    status: "Update Successful!",
    token,
  });
};
