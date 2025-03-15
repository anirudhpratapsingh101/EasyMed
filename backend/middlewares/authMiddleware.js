const jwt = require("jsonwebtoken");
const User = require("../models/userModel");

exports.protect = async (req, res, next) => {
  try {
    let token;
    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith("Bearer")
    ) {
      token = req.headers.authorization.split(" ")[1]; // ✅ Extract token
    }

    if (!token) {
      return res
        .status(401)
        .json({ status: "fail", message: "Not authorized, no token" });
    }

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = await User.findById(decoded.id).select("-password"); // ✅ Attach user to req

    next(); // ✅ Move to next middleware
  } catch (error) {
    res
      .status(401)
      .json({ status: "fail", message: "Token invalid or expired" });
  }
};
