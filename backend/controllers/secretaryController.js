const Secretary = require('../models/Secretary');
const Doctor = require('../models/Doctor');
const User = require('../models/User');
const { AppError } = require('../utils/appError');
const { catchAsync } = require('../utils/catchAsync');

// Get secretaries for a doctor
const getSecretaries = catchAsync(async (req, res, next) => {
  const doctor = await Doctor.findOne({ user: req.user._id });
  if (!doctor) {
    return next(new AppError('Doctor profile not found', 404));
  }

  const secretaries = await Secretary.find({ doctor: doctor._id })
    .populate('user', 'firstName lastName avatar email phoneNumber isActive');

  res.status(200).json({
    status: 'success',
    results: secretaries.length,
    data: {
      secretaries
    }
  });
});

// Add secretary
const addSecretary = catchAsync(async (req, res, next) => {
  const {
    userId,
    jobTitle,
    department,
    salary,
    permissions,
    workSchedule
  } = req.body;

  const doctor = await Doctor.findOne({ user: req.user._id });
  if (!doctor) {
    return next(new AppError('Doctor profile not found', 404));
  }

  const user = await User.findById(userId);
  if (!user) {
    return next(new AppError('User not found', 404));
  }

  if (user.role !== 'secretary') {
    return next(new AppError('User must have secretary role', 400));
  }

  // Check if secretary is already assigned to this doctor
  const existingSecretary = await Secretary.findOne({ user: userId, doctor: doctor._id });
  if (existingSecretary) {
    return next(new AppError('Secretary is already assigned to this doctor', 400));
  }

  const secretary = await Secretary.create({
    user: userId,
    doctor: doctor._id,
    jobTitle,
    department,
    salary,
    permissions: permissions || {},
    workSchedule: workSchedule || {}
  });

  // Update user's secretary profile reference
  user.secretaryProfile = secretary._id;
  await user.save();

  // Add to doctor's secretaries list
  doctor.secretaries.push({
    secretary: secretary._id,
    permissions: permissions || {},
    addedAt: new Date()
  });
  await doctor.save();

  await secretary.populate('user', 'firstName lastName avatar email phoneNumber');

  res.status(201).json({
    status: 'success',
    message: 'Secretary added successfully',
    data: {
      secretary
    }
  });
});

// Get secretary profile
const getSecretaryProfile = catchAsync(async (req, res, next) => {
  const secretary = await Secretary.findOne({ user: req.user._id })
    .populate('user', 'firstName lastName avatar email phoneNumber')
    .populate('doctor', 'user specialization')
    .populate('doctor.user', 'firstName lastName');

  if (!secretary) {
    return next(new AppError('Secretary profile not found', 404));
  }

  res.status(200).json({
    status: 'success',
    data: {
      secretary
    }
  });
});

// Update secretary profile
const updateSecretaryProfile = catchAsync(async (req, res, next) => {
  const secretary = await Secretary.findOneAndUpdate(
    { user: req.user._id },
    req.body,
    { new: true, runValidators: true }
  ).populate('user', 'firstName lastName avatar email phoneNumber');

  if (!secretary) {
    return next(new AppError('Secretary profile not found', 404));
  }

  res.status(200).json({
    status: 'success',
    message: 'Secretary profile updated successfully',
    data: {
      secretary
    }
  });
});

// Get secretary by ID
const getSecretaryById = catchAsync(async (req, res, next) => {
  const secretary = await Secretary.findById(req.params.id)
    .populate('user', 'firstName lastName avatar email phoneNumber')
    .populate('doctor', 'user specialization');

  if (!secretary) {
    return next(new AppError('Secretary not found', 404));
  }

  res.status(200).json({
    status: 'success',
    data: {
      secretary
    }
  });
});

// Update secretary
const updateSecretary = catchAsync(async (req, res, next) => {
  const secretary = await Secretary.findByIdAndUpdate(
    req.params.id,
    req.body,
    { new: true, runValidators: true }
  ).populate('user', 'firstName lastName avatar email phoneNumber');

  if (!secretary) {
    return next(new AppError('Secretary not found', 404));
  }

  res.status(200).json({
    status: 'success',
    message: 'Secretary updated successfully',
    data: {
      secretary
    }
  });
});

// Remove secretary
const removeSecretary = catchAsync(async (req, res, next) => {
  const secretary = await Secretary.findById(req.params.id);
  if (!secretary) {
    return next(new AppError('Secretary not found', 404));
  }

  // Remove from doctor's secretaries list
  await Doctor.findByIdAndUpdate(secretary.doctor, {
    $pull: { secretaries: { secretary: secretary._id } }
  });

  // Update termination info
  secretary.isActive = false;
  secretary.terminationDate = new Date();
  secretary.terminationReason = req.body.reason || 'Terminated by doctor';
  await secretary.save();

  res.status(200).json({
    status: 'success',
    message: 'Secretary removed successfully'
  });
});

// Update permissions
const updatePermissions = catchAsync(async (req, res, next) => {
  const { permissions } = req.body;

  const secretary = await Secretary.findByIdAndUpdate(
    req.params.id,
    { permissions },
    { new: true, runValidators: true }
  );

  if (!secretary) {
    return next(new AppError('Secretary not found', 404));
  }

  // Update permissions in doctor's record as well
  await Doctor.findOneAndUpdate(
    { 'secretaries.secretary': secretary._id },
    { $set: { 'secretaries.$.permissions': permissions } }
  );

  res.status(200).json({
    status: 'success',
    message: 'Permissions updated successfully',
    data: {
      permissions: secretary.permissions
    }
  });
});

// Activate secretary
const activateSecretary = catchAsync(async (req, res, next) => {
  const secretary = await Secretary.findByIdAndUpdate(
    req.params.id,
    { isActive: true, terminationDate: null, terminationReason: null },
    { new: true }
  );

  if (!secretary) {
    return next(new AppError('Secretary not found', 404));
  }

  res.status(200).json({
    status: 'success',
    message: 'Secretary activated successfully',
    data: {
      secretary
    }
  });
});

// Deactivate secretary
const deactivateSecretary = catchAsync(async (req, res, next) => {
  const { reason } = req.body;

  const secretary = await Secretary.findByIdAndUpdate(
    req.params.id,
    {
      isActive: false,
      terminationDate: new Date(),
      terminationReason: reason || 'Deactivated by doctor'
    },
    { new: true }
  );

  if (!secretary) {
    return next(new AppError('Secretary not found', 404));
  }

  res.status(200).json({
    status: 'success',
    message: 'Secretary deactivated successfully',
    data: {
      secretary
    }
  });
});

// Get secretary performance
const getSecretaryPerformance = catchAsync(async (req, res, next) => {
  const secretary = await Secretary.findById(req.params.id)
    .select('performance user')
    .populate('user', 'firstName lastName');

  if (!secretary) {
    return next(new AppError('Secretary not found', 404));
  }

  res.status(200).json({
    status: 'success',
    data: {
      performance: secretary.performance,
      secretary: {
        id: secretary._id,
        name: secretary.user.fullName
      }
    }
  });
});

// Rate secretary
const rateSecretary = catchAsync(async (req, res, next) => {
  const { rating, feedback } = req.body;

  if (!rating || rating < 1 || rating > 5) {
    return next(new AppError('Rating must be between 1 and 5', 400));
  }

  const secretary = await Secretary.findById(req.params.id);
  if (!secretary) {
    return next(new AppError('Secretary not found', 404));
  }

  // Calculate new average rating
  const newCount = secretary.performance.rating.count + 1;
  const newAverage = ((secretary.performance.rating.average * secretary.performance.rating.count) + rating) / newCount;

  secretary.performance.rating.average = Math.round(newAverage * 10) / 10;
  secretary.performance.rating.count = newCount;

  await secretary.save();

  res.status(200).json({
    status: 'success',
    message: 'Secretary rated successfully',
    data: {
      rating: secretary.performance.rating
    }
  });
});

module.exports = {
  getSecretaries,
  addSecretary,
  getSecretaryProfile,
  updateSecretaryProfile,
  getSecretaryById,
  updateSecretary,
  removeSecretary,
  updatePermissions,
  activateSecretary,
  deactivateSecretary,
  getSecretaryPerformance,
  rateSecretary
};