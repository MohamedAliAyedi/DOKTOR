const User = require('../models/User');
const Doctor = require('../models/Doctor');
const Patient = require('../models/Patient');
const Secretary = require('../models/Secretary');
const { AppError } = require('../utils/appError');
const { catchAsync } = require('../utils/catchAsync');

// Get current user profile
const getProfile = catchAsync(async (req, res, next) => {
  let user = await User.findById(req.user._id).select('-password -refreshTokens');
  
  // Populate role-specific profile
  if (user.role === 'doctor' && user.doctorProfile) {
    await user.populate('doctorProfile');
  } else if (user.role === 'patient' && user.patientProfile) {
    await user.populate('patientProfile');
  } else if (user.role === 'secretary' && user.secretaryProfile) {
    await user.populate('secretaryProfile');
  }

  res.status(200).json({
    status: 'success',
    data: {
      user
    }
  });
});

// Update user profile
const updateProfile = catchAsync(async (req, res, next) => {
  const {
    firstName,
    lastName,
    phoneNumber,
    preferences,
    // Role-specific fields
    doctorData,
    patientData,
    secretaryData
  } = req.body;

  // Update basic user info
  const updateData = {};
  if (firstName) updateData.firstName = firstName;
  if (lastName) updateData.lastName = lastName;
  if (phoneNumber) updateData.phoneNumber = phoneNumber;
  if (preferences) updateData.preferences = { ...req.user.preferences, ...preferences };

  const user = await User.findByIdAndUpdate(
    req.user._id,
    updateData,
    { new: true, runValidators: true }
  ).select('-password -refreshTokens');

  // Update role-specific profile
  if (req.user.role === 'doctor' && doctorData && user.doctorProfile) {
    await Doctor.findByIdAndUpdate(
      user.doctorProfile,
      doctorData,
      { new: true, runValidators: true }
    );
  } else if (req.user.role === 'patient' && patientData && user.patientProfile) {
    await Patient.findByIdAndUpdate(
      user.patientProfile,
      patientData,
      { new: true, runValidators: true }
    );
  } else if (req.user.role === 'secretary' && secretaryData && user.secretaryProfile) {
    await Secretary.findByIdAndUpdate(
      user.secretaryProfile,
      secretaryData,
      { new: true, runValidators: true }
    );
  }

  res.status(200).json({
    status: 'success',
    message: 'Profile updated successfully',
    data: {
      user
    }
  });
});

// Upload avatar
const uploadAvatar = catchAsync(async (req, res, next) => {
  if (!req.file) {
    return next(new AppError('No file uploaded', 400));
  }

  const user = await User.findByIdAndUpdate(
    req.user._id,
    { avatar: req.file.path },
    { new: true }
  ).select('-password -refreshTokens');

  res.status(200).json({
    status: 'success',
    message: 'Avatar uploaded successfully',
    data: {
      user,
      avatarUrl: req.file.path
    }
  });
});

// Delete avatar
const deleteAvatar = catchAsync(async (req, res, next) => {
  const user = await User.findByIdAndUpdate(
    req.user._id,
    { avatar: null },
    { new: true }
  ).select('-password -refreshTokens');

  res.status(200).json({
    status: 'success',
    message: 'Avatar deleted successfully',
    data: {
      user
    }
  });
});

// Get users (admin/doctor/secretary)
const getUsers = catchAsync(async (req, res, next) => {
  const {
    page = 1,
    limit = 20,
    role,
    isActive,
    search,
    sortBy = 'createdAt',
    sortOrder = 'desc'
  } = req.query;

  let query = {};

  // Apply filters
  if (role) query.role = role;
  if (isActive !== undefined) query.isActive = isActive === 'true';

  // Search functionality
  if (search) {
    query.$or = [
      { firstName: { $regex: search, $options: 'i' } },
      { lastName: { $regex: search, $options: 'i' } },
      { email: { $regex: search, $options: 'i' } }
    ];
  }

  // Build sort object
  const sort = {};
  sort[sortBy] = sortOrder === 'desc' ? -1 : 1;

  const users = await User.find(query)
    .select('-password -refreshTokens')
    .sort(sort)
    .limit(limit * 1)
    .skip((page - 1) * limit);

  const total = await User.countDocuments(query);

  res.status(200).json({
    status: 'success',
    results: users.length,
    pagination: {
      page: parseInt(page),
      limit: parseInt(limit),
      total,
      pages: Math.ceil(total / limit)
    },
    data: {
      users
    }
  });
});

// Search users
const searchUsers = catchAsync(async (req, res, next) => {
  const { query, role, limit = 10 } = req.query;

  if (!query) {
    return next(new AppError('Search query is required', 400));
  }

  let searchQuery = {
    $or: [
      { firstName: { $regex: query, $options: 'i' } },
      { lastName: { $regex: query, $options: 'i' } },
      { email: { $regex: query, $options: 'i' } }
    ],
    isActive: true
  };

  if (role) {
    searchQuery.role = role;
  }

  const users = await User.find(searchQuery)
    .select('firstName lastName email avatar role')
    .limit(parseInt(limit));

  res.status(200).json({
    status: 'success',
    results: users.length,
    data: {
      users
    }
  });
});

// Get user by ID (admin only)
const getUserById = catchAsync(async (req, res, next) => {
  const user = await User.findById(req.params.id)
    .select('-password -refreshTokens')
    .populate('doctorProfile patientProfile secretaryProfile');

  if (!user) {
    return next(new AppError('User not found', 404));
  }

  res.status(200).json({
    status: 'success',
    data: {
      user
    }
  });
});

// Update user (admin only)
const updateUser = catchAsync(async (req, res, next) => {
  const user = await User.findByIdAndUpdate(
    req.params.id,
    req.body,
    { new: true, runValidators: true }
  ).select('-password -refreshTokens');

  if (!user) {
    return next(new AppError('User not found', 404));
  }

  res.status(200).json({
    status: 'success',
    message: 'User updated successfully',
    data: {
      user
    }
  });
});

// Delete user (admin only)
const deleteUser = catchAsync(async (req, res, next) => {
  const user = await User.findById(req.params.id);

  if (!user) {
    return next(new AppError('User not found', 404));
  }

  // Soft delete
  user.isActive = false;
  user.refreshTokens = [];
  await user.save({ validateBeforeSave: false });

  res.status(200).json({
    status: 'success',
    message: 'User deleted successfully'
  });
});

// Activate user (admin only)
const activateUser = catchAsync(async (req, res, next) => {
  const user = await User.findByIdAndUpdate(
    req.params.id,
    { isActive: true },
    { new: true }
  ).select('-password -refreshTokens');

  if (!user) {
    return next(new AppError('User not found', 404));
  }

  res.status(200).json({
    status: 'success',
    message: 'User activated successfully',
    data: {
      user
    }
  });
});

// Deactivate user (admin only)
const deactivateUser = catchAsync(async (req, res, next) => {
  const user = await User.findByIdAndUpdate(
    req.params.id,
    { isActive: false, refreshTokens: [] },
    { new: true }
  ).select('-password -refreshTokens');

  if (!user) {
    return next(new AppError('User not found', 404));
  }

  res.status(200).json({
    status: 'success',
    message: 'User deactivated successfully',
    data: {
      user
    }
  });
});

module.exports = {
  getProfile,
  updateProfile,
  uploadAvatar,
  deleteAvatar,
  getUsers,
  searchUsers,
  getUserById,
  updateUser,
  deleteUser,
  activateUser,
  deactivateUser
};