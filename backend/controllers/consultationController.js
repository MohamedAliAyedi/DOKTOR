const Consultation = require('../models/Consultation');
const Appointment = require('../models/Appointment');
const Doctor = require('../models/Doctor');
const Patient = require('../models/Patient');
const Prescription = require('../models/Prescription');
const MedicalRecord = require('../models/MedicalRecord');
const { AppError } = require('../utils/appError');
const { catchAsync } = require('../utils/catchAsync');

// Get consultations
const getConsultations = catchAsync(async (req, res, next) => {
  const {
    page = 1,
    limit = 20,
    status,
    type,
    patientId,
    startDate,
    endDate
  } = req.query;

  let query = {};

  // Filter based on user role
  if (req.user.role === 'patient') {
    const patient = await Patient.findOne({ user: req.user._id });
    query.patient = patient._id;
  } else if (req.user.role === 'doctor') {
    const doctor = await Doctor.findOne({ user: req.user._id });
    query.doctor = doctor._id;
  }

  // Apply filters
  if (status) query.status = status;
  if (type) query.type = type;
  if (patientId) query.patient = patientId;

  // Date range filter
  if (startDate || endDate) {
    query.startTime = {};
    if (startDate) query.startTime.$gte = new Date(startDate);
    if (endDate) query.startTime.$lte = new Date(endDate);
  }

  const consultations = await Consultation.find(query)
    .populate('patient', 'user patientId')
    .populate('doctor', 'user specialization')
    .populate('appointment', 'appointmentId scheduledDate')
    .populate('patient.user doctor.user', 'firstName lastName avatar')
    .sort({ startTime: -1 })
    .limit(limit * 1)
    .skip((page - 1) * limit);

  const total = await Consultation.countDocuments(query);

  res.status(200).json({
    status: 'success',
    results: consultations.length,
    pagination: {
      page: parseInt(page),
      limit: parseInt(limit),
      total,
      pages: Math.ceil(total / limit)
    },
    data: {
      consultations
    }
  });
});

// Create consultation
const createConsultation = catchAsync(async (req, res, next) => {
  const {
    appointmentId,
    patientId,
    type,
    chiefComplaint,
    presentIllness,
    symptoms
  } = req.body;

  if (!appointmentId && !patientId) {
    return next(new AppError('Either appointment ID or patient ID is required', 400));
  }

  const doctor = await Doctor.findOne({ user: req.user._id });
  if (!doctor) {
    return next(new AppError('Doctor profile not found', 404));
  }

  let appointment, patient;

  if (appointmentId) {
    appointment = await Appointment.findById(appointmentId);
    if (!appointment) {
      return next(new AppError('Appointment not found', 404));
    }
    patient = await Patient.findById(appointment.patient);
  } else {
    patient = await Patient.findById(patientId);
    if (!patient) {
      return next(new AppError('Patient not found', 404));
    }
  }

  const consultation = await Consultation.create({
    appointment: appointmentId,
    patient: patient._id,
    doctor: doctor._id,
    startTime: new Date(),
    type: type || 'in-person',
    chiefComplaint,
    presentIllness,
    symptoms: symptoms || []
  });

  // Update appointment status if linked
  if (appointment) {
    appointment.status = 'in-progress';
    appointment.consultation = consultation._id;
    await appointment.save();
  }

  await consultation.populate('patient doctor appointment');
  await consultation.populate('patient.user doctor.user', 'firstName lastName avatar');

  res.status(201).json({
    status: 'success',
    message: 'Consultation created successfully',
    data: {
      consultation
    }
  });
});

// Get consultation by ID
const getConsultationById = catchAsync(async (req, res, next) => {
  const consultation = await Consultation.findById(req.params.id)
    .populate('patient', 'user patientId dateOfBirth gender medicalHistory')
    .populate('doctor', 'user specialization')
    .populate('appointment', 'appointmentId scheduledDate')
    .populate('prescriptions')
    .populate('patient.user doctor.user', 'firstName lastName avatar');

  if (!consultation) {
    return next(new AppError('Consultation not found', 404));
  }

  // Check access permissions
  const hasAccess = 
    consultation.patient.user._id.toString() === req.user._id.toString() ||
    consultation.doctor.user._id.toString() === req.user._id.toString() ||
    req.user.role === 'admin';

  if (!hasAccess) {
    return next(new AppError('Access denied to this consultation', 403));
  }

  res.status(200).json({
    status: 'success',
    data: {
      consultation
    }
  });
});

// Update consultation
const updateConsultation = catchAsync(async (req, res, next) => {
  const consultation = await Consultation.findByIdAndUpdate(
    req.params.id,
    req.body,
    { new: true, runValidators: true }
  ).populate('patient doctor');

  if (!consultation) {
    return next(new AppError('Consultation not found', 404));
  }

  res.status(200).json({
    status: 'success',
    message: 'Consultation updated successfully',
    data: {
      consultation
    }
  });
});

// Start consultation
const startConsultation = catchAsync(async (req, res, next) => {
  const consultation = await Consultation.findById(req.params.id);

  if (!consultation) {
    return next(new AppError('Consultation not found', 404));
  }

  if (consultation.status !== 'in-progress') {
    return next(new AppError('Consultation is not in progress', 400));
  }

  consultation.startTime = new Date();
  await consultation.save();

  res.status(200).json({
    status: 'success',
    message: 'Consultation started successfully',
    data: {
      consultation
    }
  });
});

// Complete consultation
const completeConsultation = catchAsync(async (req, res, next) => {
  const consultation = await Consultation.findById(req.params.id);

  if (!consultation) {
    return next(new AppError('Consultation not found', 404));
  }

  consultation.status = 'completed';
  consultation.endTime = new Date();
  await consultation.save();

  // Update linked appointment
  if (consultation.appointment) {
    await Appointment.findByIdAndUpdate(consultation.appointment, {
      status: 'completed'
    });
  }

  // Update doctor statistics
  const doctor = await Doctor.findById(consultation.doctor);
  if (doctor) {
    doctor.statistics.totalConsultations += 1;
    
    // Update average consultation time
    const totalTime = doctor.statistics.averageConsultationTime * (doctor.statistics.totalConsultations - 1);
    const newAverage = (totalTime + consultation.duration) / doctor.statistics.totalConsultations;
    doctor.statistics.averageConsultationTime = Math.round(newAverage);
    
    await doctor.save();
  }

  res.status(200).json({
    status: 'success',
    message: 'Consultation completed successfully',
    data: {
      consultation
    }
  });
});

// Add diagnosis
const addDiagnosis = catchAsync(async (req, res, next) => {
  const { primary, secondary, differential } = req.body;

  const consultation = await Consultation.findById(req.params.id);
  if (!consultation) {
    return next(new AppError('Consultation not found', 404));
  }

  consultation.diagnosis = {
    primary,
    secondary: secondary || [],
    differential: differential || []
  };

  await consultation.save();

  res.status(200).json({
    status: 'success',
    message: 'Diagnosis added successfully',
    data: {
      consultation
    }
  });
});

// Generate consultation report
const generateConsultationReport = catchAsync(async (req, res, next) => {
  const consultation = await Consultation.findById(req.params.id)
    .populate('patient', 'user patientId dateOfBirth gender')
    .populate('doctor', 'user specialization licenseNumber')
    .populate('patient.user doctor.user', 'firstName lastName')
    .populate('prescriptions')
    .populate('appointment', 'appointmentId scheduledDate');

  if (!consultation) {
    return next(new AppError('Consultation not found', 404));
  }

  // Here you would implement PDF generation logic
  // For now, return consultation data
  res.status(200).json({
    status: 'success',
    message: 'Report generation not implemented yet',
    data: {
      consultation
    }
  });
});

// Get consultation statistics
const getConsultationStatistics = catchAsync(async (req, res, next) => {
  const { startDate, endDate } = req.query;

  let matchQuery = {};
  
  if (req.user.role === 'doctor') {
    const doctor = await Doctor.findOne({ user: req.user._id });
    matchQuery.doctor = doctor._id;
  }

  if (startDate || endDate) {
    matchQuery.startTime = {};
    if (startDate) matchQuery.startTime.$gte = new Date(startDate);
    if (endDate) matchQuery.startTime.$lte = new Date(endDate);
  }

  const stats = await Consultation.aggregate([
    { $match: matchQuery },
    {
      $group: {
        _id: null,
        totalConsultations: { $sum: 1 },
        completedConsultations: {
          $sum: { $cond: [{ $eq: ['$status', 'completed'] }, 1, 0] }
        },
        averageDuration: { $avg: '$duration' },
        consultationsByType: {
          $push: '$type'
        }
      }
    }
  ]);

  res.status(200).json({
    status: 'success',
    data: {
      statistics: stats[0] || {}
    }
  });
});

// Delete consultation
const deleteConsultation = catchAsync(async (req, res, next) => {
  const consultation = await Consultation.findByIdAndDelete(req.params.id);

  if (!consultation) {
    return next(new AppError('Consultation not found', 404));
  }

  res.status(200).json({
    status: 'success',
    message: 'Consultation deleted successfully'
  });
});

// Add prescription to consultation
const addPrescription = catchAsync(async (req, res, next) => {
  const consultation = await Consultation.findById(req.params.id);
  if (!consultation) {
    return next(new AppError('Consultation not found', 404));
  }

  const prescription = await Prescription.create({
    ...req.body,
    patient: consultation.patient,
    doctor: consultation.doctor,
    consultation: consultation._id
  });

  consultation.prescriptions.push(prescription._id);
  await consultation.save();

  res.status(201).json({
    status: 'success',
    message: 'Prescription added to consultation',
    data: {
      prescription
    }
  });
});

// Order lab test
const orderLabTest = catchAsync(async (req, res, next) => {
  const { testName, urgency, instructions } = req.body;

  const consultation = await Consultation.findById(req.params.id);
  if (!consultation) {
    return next(new AppError('Consultation not found', 404));
  }

  consultation.labOrders.push({
    testName,
    urgency: urgency || 'routine',
    instructions,
    orderedAt: new Date()
  });

  await consultation.save();

  res.status(201).json({
    status: 'success',
    message: 'Lab test ordered successfully',
    data: {
      consultation
    }
  });
});

// Order imaging
const orderImaging = catchAsync(async (req, res, next) => {
  const { type, bodyPart, urgency, instructions } = req.body;

  const consultation = await Consultation.findById(req.params.id);
  if (!consultation) {
    return next(new AppError('Consultation not found', 404));
  }

  consultation.imagingOrders.push({
    type,
    bodyPart,
    urgency: urgency || 'routine',
    instructions,
    orderedAt: new Date()
  });

  await consultation.save();

  res.status(201).json({
    status: 'success',
    message: 'Imaging ordered successfully',
    data: {
      consultation
    }
  });
});

// Refer to specialist
const referToSpecialist = catchAsync(async (req, res, next) => {
  const { specialistId, specialization, reason, urgency, notes } = req.body;

  const consultation = await Consultation.findById(req.params.id);
  if (!consultation) {
    return next(new AppError('Consultation not found', 404));
  }

  consultation.referrals.push({
    specialist: specialistId,
    specialization,
    reason,
    urgency: urgency || 'routine',
    notes,
    referredAt: new Date()
  });

  await consultation.save();

  res.status(201).json({
    status: 'success',
    message: 'Referral created successfully',
    data: {
      consultation
    }
  });
});

module.exports = {
  getConsultations,
  createConsultation,
  getConsultationById,
  updateConsultation,
  deleteConsultation,
  startConsultation,
  completeConsultation,
  addDiagnosis,
  addPrescription,
  orderLabTest,
  orderImaging,
  referToSpecialist,
  generateConsultationReport,
  getConsultationStatistics
};