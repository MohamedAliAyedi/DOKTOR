const Doctor = require('../models/Doctor');
const Patient = require('../models/Patient');
const User = require('../models/User');
const Appointment = require('../models/Appointment');
const Consultation = require('../models/Consultation');
const Bill = require('../models/Bill');
const { AppError } = require('../utils/appError');
const { catchAsync } = require('../utils/catchAsync');

// Search doctors
const searchDoctors = catchAsync(async (req, res, next) => {
  const {
    page = 1,
    limit = 20,
    specialization,
    city,
    rating,
    availableToday,
    search,
    sortBy = 'rating.average',
    sortOrder = 'desc'
  } = req.query;

  let query = {};

  // Apply filters
  if (specialization) {
    query.specialization = { $regex: specialization, $options: 'i' };
  }

  if (city) {
    query['clinicInfo.address.city'] = { $regex: city, $options: 'i' };
  }

  if (rating) {
    query['rating.average'] = { $gte: parseFloat(rating) };
  }

  if (search) {
    // We'll handle search after population
  }

  // Build sort object
  const sort = {};
  sort[sortBy] = sortOrder === 'desc' ? -1 : 1;

  const doctors = await Doctor.find(query)
    .populate({
      path: 'user',
      match: { role: 'doctor', isActive: true },
      select: 'firstName lastName avatar email phoneNumber'
    })
    .sort(sort)
    .limit(limit * 1)
    .skip((page - 1) * limit);

  // Filter out doctors where user population failed
  let filteredDoctors = doctors.filter(doctor => doctor.user);

  // Apply search filter after population
  if (search) {
    filteredDoctors = filteredDoctors.filter(doctor => 
      doctor.user?.firstName?.toLowerCase().includes(search.toLowerCase()) ||
      doctor.user?.lastName?.toLowerCase().includes(search.toLowerCase()) ||
      doctor.specialization?.toLowerCase().includes(search.toLowerCase())
    );
  }

  // Get total count with user filter
  const totalDoctors = await Doctor.find(query).populate({
    path: 'user',
    match: { role: 'doctor', isActive: true }
  });
  const total = totalDoctors.filter(d => d.user).length;

  res.status(200).json({
    status: 'success',
    results: filteredDoctors.length,
    pagination: {
      page: parseInt(page),
      limit: parseInt(limit),
      total,
      pages: Math.ceil(total / limit)
    },
    data: {
      doctors: filteredDoctors
    }
  });
});

// Get all doctors (protected)
const getDoctors = catchAsync(async (req, res, next) => {
  const { page = 1, limit = 20 } = req.query;

  const doctors = await Doctor.find()
    .populate('user', 'firstName lastName avatar email phoneNumber isActive')
    .sort({ 'rating.average': -1 })
    .limit(limit * 1)
    .skip((page - 1) * limit);

  const total = await Doctor.countDocuments();

  res.status(200).json({
    status: 'success',
    results: doctors.length,
    pagination: {
      page: parseInt(page),
      limit: parseInt(limit),
      total,
      pages: Math.ceil(total / limit)
    },
    data: {
      doctors
    }
  });
});

// Get doctor profile
const getDoctorProfile = catchAsync(async (req, res, next) => {
  const doctor = await Doctor.findOne({ user: req.user._id })
    .populate('user', 'firstName lastName avatar email phoneNumber')
    .populate('patients.patient', 'user patientId')
    .populate('secretaries.secretary', 'user employeeId');

  if (!doctor) {
    return next(new AppError('Doctor profile not found', 404));
  }

  res.status(200).json({
    status: 'success',
    data: {
      doctor
    }
  });
});

// Update doctor profile
const updateDoctorProfile = catchAsync(async (req, res, next) => {
  const doctor = await Doctor.findOneAndUpdate(
    { user: req.user._id },
    req.body,
    { new: true, runValidators: true }
  ).populate('user', 'firstName lastName avatar email phoneNumber');

  if (!doctor) {
    return next(new AppError('Doctor profile not found', 404));
  }

  res.status(200).json({
    status: 'success',
    message: 'Doctor profile updated successfully',
    data: {
      doctor
    }
  });
});

// Get doctor by ID
const getDoctorById = catchAsync(async (req, res, next) => {
  const doctor = await Doctor.findById(req.params.id)
    .populate('user', 'firstName lastName avatar email phoneNumber')
    .select('-patients -secretaries'); // Hide sensitive data

  if (!doctor) {
    return next(new AppError('Doctor not found', 404));
  }

  res.status(200).json({
    status: 'success',
    data: {
      doctor
    }
  });
});

// Connect patient to doctor
const connectToDoctor = catchAsync(async (req, res, next) => {
  const doctorId = req.params.id;
  const { message } = req.body;

  const doctor = await Doctor.findById(doctorId);
  if (!doctor) {
    return next(new AppError('Doctor not found', 404));
  }

  const patient = await Patient.findOne({ user: req.user._id });
  if (!patient) {
    return next(new AppError('Patient profile not found', 404));
  }

  // Check if already connected
  const existingConnection = patient.doctors.find(
    d => d.doctor.toString() === doctorId
  );

  if (existingConnection && existingConnection.status === 'active') {
    return next(new AppError('Already connected to this doctor', 400));
  }

  if (existingConnection && existingConnection.status === 'pending') {
    return next(new AppError('Connection request already pending', 400));
  }

  // Add to patient's doctors list
  patient.doctors.push({
    doctor: doctorId,
    status: 'pending',
    connectedAt: new Date()
  });

  // Add to doctor's patients list
  doctor.patients.push({
    patient: patient._id,
    status: 'pending',
    connectedAt: new Date()
  });

  await patient.save();
  await doctor.save();

  // Create notification for doctor
  await Notification.create({
    recipient: doctor.user,
    sender: req.user._id,
    type: 'connection-request',
    title: 'New Patient Connection Request',
    message: message || `${req.user.fullName} wants to connect with you as their doctor`,
    data: {
      patientId: patient._id,
      message
    }
  });

  res.status(200).json({
    status: 'success',
    message: 'Connection request sent successfully'
  });
});

// Disconnect from doctor
const disconnectFromDoctor = catchAsync(async (req, res, next) => {
  const doctorId = req.params.id;

  const patient = await Patient.findOne({ user: req.user._id });
  if (!patient) {
    return next(new AppError('Patient profile not found', 404));
  }

  // Remove from patient's doctors list
  patient.doctors = patient.doctors.filter(
    d => d.doctor.toString() !== doctorId
  );

  // Remove from doctor's patients list
  await Doctor.findByIdAndUpdate(doctorId, {
    $pull: { patients: { patient: patient._id } }
  });

  await patient.save();

  res.status(200).json({
    status: 'success',
    message: 'Disconnected from doctor successfully'
  });
});

// Rate doctor
const rateDoctor = catchAsync(async (req, res, next) => {
  const { rating, review } = req.body;
  const doctorId = req.params.id;

  if (!rating || rating < 1 || rating > 5) {
    return next(new AppError('Rating must be between 1 and 5', 400));
  }

  const doctor = await Doctor.findById(doctorId);
  if (!doctor) {
    return next(new AppError('Doctor not found', 404));
  }

  // Calculate new average rating
  const newCount = doctor.rating.count + 1;
  const newAverage = ((doctor.rating.average * doctor.rating.count) + rating) / newCount;

  doctor.rating.average = Math.round(newAverage * 10) / 10; // Round to 1 decimal
  doctor.rating.count = newCount;

  await doctor.save();

  res.status(200).json({
    status: 'success',
    message: 'Doctor rated successfully',
    data: {
      rating: doctor.rating
    }
  });
});

// Get doctor's patients
const getDoctorPatients = catchAsync(async (req, res, next) => {
  const doctor = await Doctor.findOne({ user: req.user._id })
    .populate({
      path: 'patients.patient',
      populate: {
        path: 'user',
        select: 'firstName lastName avatar email phoneNumber'
      }
    });

  if (!doctor) {
    return next(new AppError('Doctor profile not found', 404));
  }

  res.status(200).json({
    status: 'success',
    data: {
      patients: doctor.patients
    }
  });
});

// Get doctor statistics
const getDoctorStatistics = catchAsync(async (req, res, next) => {
  const doctor = await Doctor.findOne({ user: req.user._id });
  if (!doctor) {
    return next(new AppError('Doctor profile not found', 404));
  }

  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const startOfWeek = new Date(now.setDate(now.getDate() - now.getDay()));

  // Get various statistics
  const [
    totalPatients,
    monthlyAppointments,
    weeklyAppointments,
    todayAppointments,
    monthlyRevenue,
    completedConsultations
  ] = await Promise.all([
    Patient.countDocuments({ 'doctors.doctor': doctor._id, 'doctors.status': 'active' }),
    Appointment.countDocuments({ doctor: doctor._id, scheduledDate: { $gte: startOfMonth } }),
    Appointment.countDocuments({ doctor: doctor._id, scheduledDate: { $gte: startOfWeek } }),
    Appointment.countDocuments({ 
      doctor: doctor._id, 
      scheduledDate: { 
        $gte: new Date().setHours(0, 0, 0, 0),
        $lt: new Date().setHours(23, 59, 59, 999)
      }
    }),
    Bill.aggregate([
      { 
        $match: { 
          doctor: doctor._id, 
          paymentStatus: 'paid',
          'paymentDetails.paymentDate': { $gte: startOfMonth }
        }
      },
      { $group: { _id: null, total: { $sum: '$totalAmount' } } }
    ]),
    Consultation.countDocuments({ doctor: doctor._id, status: 'completed' })
  ]);

  res.status(200).json({
    status: 'success',
    data: {
      statistics: {
        totalPatients,
        monthlyAppointments,
        weeklyAppointments,
        todayAppointments,
        monthlyRevenue: monthlyRevenue[0]?.total || 0,
        completedConsultations,
        rating: doctor.rating
      }
    }
  });
});

// Add service
const addService = catchAsync(async (req, res, next) => {
  const { name, description, price, duration } = req.body;

  const doctor = await Doctor.findOne({ user: req.user._id });
  if (!doctor) {
    return next(new AppError('Doctor profile not found', 404));
  }

  doctor.services.push({
    name,
    description,
    price,
    duration,
    isActive: true
  });

  await doctor.save();

  res.status(201).json({
    status: 'success',
    message: 'Service added successfully',
    data: {
      services: doctor.services
    }
  });
});

// Update service
const updateService = catchAsync(async (req, res, next) => {
  const { serviceId } = req.params;

  const doctor = await Doctor.findOne({ user: req.user._id });
  if (!doctor) {
    return next(new AppError('Doctor profile not found', 404));
  }

  const service = doctor.services.id(serviceId);
  if (!service) {
    return next(new AppError('Service not found', 404));
  }

  Object.assign(service, req.body);
  await doctor.save();

  res.status(200).json({
    status: 'success',
    message: 'Service updated successfully',
    data: {
      service
    }
  });
});

// Delete service
const deleteService = catchAsync(async (req, res, next) => {
  const { serviceId } = req.params;

  const doctor = await Doctor.findOne({ user: req.user._id });
  if (!doctor) {
    return next(new AppError('Doctor profile not found', 404));
  }

  doctor.services.id(serviceId).remove();
  await doctor.save();

  res.status(200).json({
    status: 'success',
    message: 'Service deleted successfully'
  });
});

// Update working hours
const updateWorkingHours = catchAsync(async (req, res, next) => {
  const doctor = await Doctor.findOneAndUpdate(
    { user: req.user._id },
    { workingHours: req.body },
    { new: true, runValidators: true }
  );

  if (!doctor) {
    return next(new AppError('Doctor profile not found', 404));
  }

  res.status(200).json({
    status: 'success',
    message: 'Working hours updated successfully',
    data: {
      workingHours: doctor.workingHours
    }
  });
});

// Add unavailability period
const addUnavailability = catchAsync(async (req, res, next) => {
  const { startDate, endDate, startTime, endTime, reason, isRecurring, recurringPattern } = req.body;

  const doctor = await Doctor.findOne({ user: req.user._id });
  if (!doctor) {
    return next(new AppError('Doctor profile not found', 404));
  }

  doctor.unavailability.push({
    startDate: new Date(startDate),
    endDate: new Date(endDate),
    startTime,
    endTime,
    reason,
    isRecurring: isRecurring || false,
    recurringPattern
  });

  await doctor.save();

  res.status(201).json({
    status: 'success',
    message: 'Unavailability period added successfully',
    data: {
      unavailability: doctor.unavailability
    }
  });
});

// Remove unavailability period
const removeUnavailability = catchAsync(async (req, res, next) => {
  const { unavailabilityId } = req.params;

  const doctor = await Doctor.findOne({ user: req.user._id });
  if (!doctor) {
    return next(new AppError('Doctor profile not found', 404));
  }

  doctor.unavailability.id(unavailabilityId).remove();
  await doctor.save();

  res.status(200).json({
    status: 'success',
    message: 'Unavailability period removed successfully'
  });
});

// Get specializations
const getSpecializations = catchAsync(async (req, res, next) => {
  const specializations = await Doctor.distinct('specialization');

  res.status(200).json({
    status: 'success',
    data: {
      specializations
    }
  });
});

module.exports = {
  searchDoctors,
  getDoctors,
  getDoctorProfile,
  updateDoctorProfile,
  getDoctorById,
  connectToDoctor,
  disconnectFromDoctor,
  rateDoctor,
  getDoctorPatients,
  getDoctorStatistics,
  addService,
  updateService,
  deleteService,
  updateWorkingHours,
  addUnavailability,
  removeUnavailability,
  getSpecializations
};