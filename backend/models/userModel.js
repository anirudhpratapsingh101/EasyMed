const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const crypto = require("crypto");

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "User must have a name"],
    },
    email: {
      type: String,
      required: [true, "User must have an email"],
      unique: true,
      lowercase: true,
    },
    password: {
      type: String,
      required: [true, "User must have a password"],
      minlength: 8,
      select: false, // Don't return password in queries
    },
    passwordConfirm: {
      type: String,
      required: [true, "User must confirm password"],
      validate: {
        validator: function (val) {
          return this.password === val;
        },
        message: "Passwords do not match",
      },
    },
    passwordChangedAt: Date,
    passwordResetToken: String,
    passwordResetExpires: Date,
    phone: {
      type: String,
      required: [true, "User must provide a phone number"],
      unique: true,
    },
    location: {
      type: {
        type: String,
        enum: ["Point"],
        default: "Point",
      },
      coordinates: {
        type: [Number], // [longitude, latitude]
        required: [true, "User must provide a location"],
      },
    },
    pharmacyName: {
      type: String,
      default: null, // Optional field
    },
    medicines: [
      {
        name: { type: String, required: true },
        price: { type: Number, required: true },
        quantity: { type: Number, required: true },
        expiryDate: { type: Date, required: true },
      },
    ],
  },
  {
    timestamps: true, // Adds createdAt & updatedAt
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// 🔹 Create a 2D geospatial index for location-based queries
userSchema.index({ location: "2dsphere" });

// 🔹 Hash password before saving
userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();

  this.password = await bcrypt.hash(this.password, 12);
  this.passwordConfirm = undefined; // 🔹 Remove only before saving to DB
  next();
});

// 🔹 Ensure `passwordChangedAt` is updated correctly
userSchema.pre("save", function (next) {
  if (!this.isModified("password") || this.isNew) return next();
  this.passwordChangedAt = Date.now() - 1000;
  next();
});

// 🔹 Method to check if entered password is correct
userSchema.methods.correctPassword = async function (
  candidatePassword,
  userPassword
) {
  return await bcrypt.compare(candidatePassword, userPassword);
};

// 🔹 Method to generate a password reset token
userSchema.methods.createPasswordResetToken = function () {
  const resetToken = crypto.randomBytes(32).toString("hex");

  this.passwordResetToken = crypto
    .createHash("sha256")
    .update(resetToken)
    .digest("hex");

  this.passwordResetExpires = Date.now() + 10 * 60 * 1000; // Expires in 10 mins

  return resetToken;
};

// 🔹 Method to reset password
userSchema.methods.resetPassword = async function (
  newPassword,
  confirmPassword
) {
  if (newPassword !== confirmPassword) {
    throw new Error("Passwords do not match");
  }

  this.password = await bcrypt.hash(newPassword, 12);
  this.passwordResetToken = undefined;
  this.passwordResetExpires = undefined;
  await this.save();
};

const User = mongoose.model("User", userSchema);
module.exports = User;
