const crypto = require("crypto");
const { validationResult } = require("express-validator");
const User = require("../models/User");
const Doctor = require("../models/Doctor");
const Patient = require("../models/Patient");
const Secretary = require("../models/Secretary");
const { AppError } = require("../utils/appError");
const { catchAsync } = require("../utils/catchAsync");
const OTPGenerator = require("../utils/otpGenerator");
const emailService = require("../utils/email");
const smsService = require("../utils/sms");

// Helper function to create and send token
const createSendToken = (user, statusCode, res, message = "Success") => {
  const token = user.generateAuthToken();
  const refreshToken = user.generateRefreshToken();

  // Save refresh token to database
  user.save({ validateBeforeSave: false });

  // Remove password from output
  user.password = undefined;
  user.refreshTokens = undefined;

  res.status(statusCode).json({
    status: "success",
    message,
    token,
    refreshToken,
    data: {
      user,
    },
  });
};

// Register new user
const register = catchAsync(async (req, res, next) => {
  // Check for validation errors
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return next(new AppError("Validation failed", 400, errors.array()));
  }

  const { firstName, lastName, email, password, phoneNumber, role } = req.body;

  // Check if user already exists
  const existingUser = await User.findOne({
    $or: [{ email }, { phoneNumber }],
  });

  if (existingUser) {
    return next(
      new AppError("User with this email or phone number already exists", 400)
    );
  }

  // Create user
  const user = await User.create({
    firstName,
    lastName,
    email,
    password,
    phoneNumber,
    role,
  });

  // Create role-specific profile
  let profile;
  switch (role) {
    case "doctor":
      profile = await Doctor.create({
        user: user._id,
        licenseNumber: `LIC-${Date.now()}`, // Temporary, should be provided by user
        specialization: "General Practice", // Default, should be updated
        experience: 0,
        consultationFee: 50,
        clinicInfo: {
          name: `${firstName} ${lastName} Clinic`,
        },
      });
      user.doctorProfile = profile._id;
      break;

    case "patient":
      profile = await Patient.create({
        user: user._id,
        dateOfBirth: new Date("1990-01-01"), // Default, should be updated
        gender: "other", // Should be updated
        emergencyContact: {
          name: "Emergency Contact",
          relationship: "Family",
          phoneNumber: phoneNumber,
        },
      });
      user.patientProfile = profile._id;
      break;

    case "secretary":
      // Secretary profile will be created when assigned to a doctor
      break;
  }

  await user.save({ validateBeforeSave: false });

  // Generate OTP for email verification
  const emailOTP = OTPGenerator.generateNumericOTP(4);
  const phoneOTP = OTPGenerator.generateNumericOTP(4);

  user.emailVerificationToken = emailOTP;
  user.phoneVerificationToken = phoneOTP;
  await user.save({ validateBeforeSave: false });

  // Send verification emails/SMS
  try {
    await emailService.sendVerificationEmail(user, emailOTP);
    await smsService.sendVerificationSMS(phoneNumber, phoneOTP);
  } catch (error) {
    console.error("Failed to send verification messages:", error);
  }

  createSendToken(
    user,
    201,
    res,
    "User registered successfully. Please verify your email and phone number."
  );
});

// Login user
const login = catchAsync(async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return next(new AppError("Validation failed", 400, errors.array()));
  }

  const { email, password } = req.body;

  console.log("Email:", email);
  console.log("Password:", password);

  // Find user and include password
  const user = await User.findOne({ email }).select("+password");

  if (!user) {
    return next(new AppError("Invalid email or password", 401));
  }

  // Check if account is locked
  if (user.isLocked) {
    return next(
      new AppError(
        "Account is temporarily locked due to multiple failed login attempts",
        423
      )
    );
  }

  // Check if account is active
  if (!user.isActive) {
    return next(
      new AppError("Account is deactivated. Please contact support.", 401)
    );
  }

  // Check password
  const isPasswordCorrect = await user.comparePassword(password);

  if (!isPasswordCorrect) {
    await user.incLoginAttempts();
    return next(new AppError("Invalid email or password", 401));
  }

  // Reset login attempts on successful login
  if (user.loginAttempts > 0) {
    await user.resetLoginAttempts();
  }

  // Update last login safely without triggering pre-save hooks
  await User.findByIdAndUpdate(user._id, { lastLogin: new Date() });

  // Send token
  createSendToken(user, 200, res, "Login successful");
});

// Forgot password
const forgotPassword = catchAsync(async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return next(new AppError("Validation failed", 400, errors.array()));
  }

  const { email } = req.body;

  const user = await User.findOne({ email });
  if (!user) {
    return next(new AppError("No user found with that email address", 404));
  }

  // Generate reset token
  const { resetToken, hashedToken } = OTPGenerator.generatePasswordResetToken();

  user.passwordResetToken = hashedToken;
  user.passwordResetExpires = new Date(Date.now() + 60 * 60 * 1000); // 1 hour
  await user.save({ validateBeforeSave: false });

  try {
    await emailService.sendPasswordResetEmail(user, resetToken);

    res.status(200).json({
      status: "success",
      message: "Password reset email sent successfully",
    });
  } catch (error) {
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save({ validateBeforeSave: false });

    return next(new AppError("Failed to send password reset email", 500));
  }
});

// Reset password
const resetPassword = catchAsync(async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return next(new AppError("Validation failed", 400, errors.array()));
  }

  const { token, password } = req.body;

  // Hash the token
  const hashedToken = crypto.createHash("sha256").update(token).digest("hex");

  // Find user with valid reset token
  const user = await User.findOne({
    passwordResetToken: hashedToken,
    passwordResetExpires: { $gt: Date.now() },
  });

  if (!user) {
    return next(new AppError("Invalid or expired reset token", 400));
  }

  // Set new password
  user.password = password;
  user.passwordResetToken = undefined;
  user.passwordResetExpires = undefined;
  user.loginAttempts = 0;
  user.lockUntil = undefined;

  await user.save();

  createSendToken(user, 200, res, "Password reset successful");
});

// Verify OTP (email or phone)
const verifyOTP = catchAsync(async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return next(new AppError("Validation failed", 400, errors.array()));
  }

  const { otp, type } = req.body;
  const { email } = req.body;

  const user = await User.findOne({ email });
  if (!user) {
    return next(new AppError("User not found", 404));
  }

  let isValidOTP = false;
  let tokenField = "";

  if (type === "email") {
    isValidOTP = user.emailVerificationToken === otp;
    tokenField = "emailVerificationToken";
  } else if (type === "phone") {
    isValidOTP = user.phoneVerificationToken === otp;
    tokenField = "phoneVerificationToken";
  }

  if (!isValidOTP) {
    return next(new AppError("Invalid OTP", 400));
  }

  // Mark as verified
  if (type === "email") {
    user.isEmailVerified = true;
    user.emailVerificationToken = undefined;
  } else if (type === "phone") {
    user.isPhoneVerified = true;
    user.phoneVerificationToken = undefined;
  }

  await user.save({ validateBeforeSave: false });

  res.status(200).json({
    status: "success",
    message: `${type} verified successfully`,
  });
});

// Resend OTP
const resendOTP = catchAsync(async (req, res, next) => {
  const { email, type } = req.body;

  const user = await User.findOne({ email });
  if (!user) {
    return next(new AppError("User not found", 404));
  }

  const otp = OTPGenerator.generateNumericOTP(4);

  if (type === "email") {
    user.emailVerificationToken = otp;
    await emailService.sendVerificationEmail(user, otp);
  } else if (type === "phone") {
    user.phoneVerificationToken = otp;
    await smsService.sendVerificationSMS(user.phoneNumber, otp);
  }

  await user.save({ validateBeforeSave: false });

  res.status(200).json({
    status: "success",
    message: `${type} OTP sent successfully`,
  });
});

// Refresh token
const refreshToken = catchAsync(async (req, res, next) => {
  const { refreshToken } = req.body;

  if (!refreshToken) {
    return next(new AppError("Refresh token is required", 400));
  }

  try {
    const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);
    const user = await User.findById(decoded.id);

    if (!user) {
      return next(new AppError("User not found", 404));
    }

    // Check if refresh token exists in user's tokens
    const tokenExists = user.refreshTokens.some(
      (tokenObj) => tokenObj.token === refreshToken
    );
    if (!tokenExists) {
      return next(new AppError("Invalid refresh token", 401));
    }

    // Generate new tokens
    const newToken = user.generateAuthToken();
    const newRefreshToken = user.generateRefreshToken();

    // Remove old refresh token
    user.refreshTokens = user.refreshTokens.filter(
      (tokenObj) => tokenObj.token !== refreshToken
    );
    await user.save({ validateBeforeSave: false });

    res.status(200).json({
      status: "success",
      token: newToken,
      refreshToken: newRefreshToken,
    });
  } catch (error) {
    return next(new AppError("Invalid refresh token", 401));
  }
});

// Logout
const logout = catchAsync(async (req, res, next) => {
  const { refreshToken } = req.body;

  if (refreshToken) {
    // Remove specific refresh token
    req.user.refreshTokens = req.user.refreshTokens.filter(
      (tokenObj) => tokenObj.token !== refreshToken
    );
  } else {
    // Remove all refresh tokens
    req.user.refreshTokens = [];
  }

  await req.user.save({ validateBeforeSave: false });

  res.status(200).json({
    status: "success",
    message: "Logout successful",
  });
});

// Logout from all devices
const logoutAll = catchAsync(async (req, res, next) => {
  req.user.refreshTokens = [];
  await req.user.save({ validateBeforeSave: false });

  res.status(200).json({
    status: "success",
    message: "Logged out from all devices",
  });
});

// Get current user
const getMe = catchAsync(async (req, res, next) => {
  let user = req.user.toObject();

  // Populate role-specific profile
  if (user.role === "doctor" && user.doctorProfile) {
    const doctorProfile = await Doctor.findById(user.doctorProfile);
    user.profile = doctorProfile;
  } else if (user.role === "patient" && user.patientProfile) {
    const patientProfile = await Patient.findById(user.patientProfile);
    user.profile = patientProfile;
  } else if (user.role === "secretary" && user.secretaryProfile) {
    const secretaryProfile = await Secretary.findById(user.secretaryProfile);
    user.profile = secretaryProfile;
  }

  res.status(200).json({
    status: "success",
    data: {
      user,
    },
  });
});

// Update password
const updatePassword = catchAsync(async (req, res, next) => {
  const { currentPassword, newPassword } = req.body;

  if (!currentPassword || !newPassword) {
    return next(
      new AppError("Current password and new password are required", 400)
    );
  }

  // Get user with password
  const user = await User.findById(req.user.id).select("+password");

  // Check current password
  const isCurrentPasswordCorrect = await user.comparePassword(currentPassword);
  if (!isCurrentPasswordCorrect) {
    return next(new AppError("Current password is incorrect", 400));
  }

  // Update password
  user.password = newPassword;
  await user.save();

  createSendToken(user, 200, res, "Password updated successfully");
});

// Update profile
const updateProfile = catchAsync(async (req, res, next) => {
  const { firstName, lastName, phoneNumber, preferences } = req.body;

  const updateData = {};
  if (firstName) updateData.firstName = firstName;
  if (lastName) updateData.lastName = lastName;
  if (phoneNumber) updateData.phoneNumber = phoneNumber;
  if (preferences)
    updateData.preferences = { ...req.user.preferences, ...preferences };

  const user = await User.findByIdAndUpdate(req.user.id, updateData, {
    new: true,
    runValidators: true,
  });

  res.status(200).json({
    status: "success",
    message: "Profile updated successfully",
    data: {
      user,
    },
  });
});

// Delete account
const deleteAccount = catchAsync(async (req, res, next) => {
  const { password } = req.body;

  if (!password) {
    return next(new AppError("Password is required to delete account", 400));
  }

  // Get user with password
  const user = await User.findById(req.user.id).select("+password");

  // Verify password
  const isPasswordCorrect = await user.comparePassword(password);
  if (!isPasswordCorrect) {
    return next(new AppError("Incorrect password", 400));
  }

  // Soft delete - deactivate account
  user.isActive = false;
  user.refreshTokens = [];
  await user.save({ validateBeforeSave: false });

  res.status(200).json({
    status: "success",
    message: "Account deleted successfully",
  });
});

module.exports = {
  register,
  login,
  forgotPassword,
  resetPassword,
  verifyOTP,
  resendOTP,
  refreshToken,
  logout,
  logoutAll,
  getMe,
  updatePassword,
  updateProfile,
  deleteAccount,
};
