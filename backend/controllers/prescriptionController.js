const Prescription = require('../models/Prescription');
const Patient = require('../models/Patient');
const Doctor = require('../models/Doctor');
const Consultation = require('../models/Consultation');
const { AppError } = require('../utils/appError');
const { catchAsync } = require('../utils/catchAsync');

// Get prescriptions
const getPrescriptions = catchAsync(async (req, res, next) => {
  const {
    page = 1,
    limit = 20,
    status,
    patientId,
    doctorId,
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

  // Apply additional filters
  if (status) query.status = status;
  if (patientId) query.patient = patientId;
  if (doctorId) query.doctor = doctorId;

  // Date range filter
  if (startDate || endDate) {
    query.createdAt = {};
    if (startDate) query.createdAt.$gte = new Date(startDate);
    if (endDate) query.createdAt.$lte = new Date(endDate);
  }

  const prescriptions = await Prescription.find(query)
    .populate('patient', 'user patientId')
    .populate('doctor', 'user specialization')
    .populate('patient.user doctor.user', 'firstName lastName avatar')
    .populate('consultation', 'consultationId')
    .sort({ createdAt: -1 })
    .limit(limit * 1)
    .skip((page - 1) * limit);

  const total = await Prescription.countDocuments(query);

  res.status(200).json({
    status: 'success',
    results: prescriptions.length,
    pagination: {
      page: parseInt(page),
      limit: parseInt(limit),
      total,
      pages: Math.ceil(total / limit)
    },
    data: {
      prescriptions
    }
  });
});

// Create prescription
const createPrescription = catchAsync(async (req, res, next) => {
  const { patientId, consultationId, medications, pharmacy } = req.body;

  if (!patientId || !medications || medications.length === 0) {
    return next(new AppError('Patient ID and medications are required', 400));
  }

  const doctor = await Doctor.findOne({ user: req.user._id });
  if (!doctor) {
    return next(new AppError('Doctor profile not found', 404));
  }

  const patient = await Patient.findById(patientId);
  if (!patient) {
    return next(new AppError('Patient not found', 404));
  }

  // Verify doctor-patient relationship
  const isConnected = doctor.patients.some(
    p => p.patient.toString() === patientId && p.status === 'active'
  );

  if (!isConnected) {
    return next(new AppError('Patient is not connected to this doctor', 403));
  }

  const prescription = await Prescription.create({
    patient: patientId,
    doctor: doctor._id,
    consultation: consultationId,
    medications,
    pharmacy,
    electronicSignature: {
      doctorSignature: {
        signed: true,
        signedAt: new Date(),
        ipAddress: req.ip
      }
    }
  });

  // Update patient's current medications
  for (const medication of medications) {
    patient.currentMedications.push({
      medication: prescription._id,
      startDate: medication.duration.startDate,
      endDate: medication.duration.endDate,
      isActive: true
    });
  }

  await patient.save();

  // If linked to consultation, update consultation
  if (consultationId) {
    await Consultation.findByIdAndUpdate(consultationId, {
      $push: { prescriptions: prescription._id }
    });
  }

  await prescription.populate('patient doctor');
  await prescription.populate('patient.user doctor.user', 'firstName lastName');

  res.status(201).json({
    status: 'success',
    message: 'Prescription created successfully',
    data: {
      prescription
    }
  });
});

// Get prescription by ID
const getPrescriptionById = catchAsync(async (req, res, next) => {
  const prescription = await Prescription.findById(req.params.id)
    .populate('patient', 'user patientId')
    .populate('doctor', 'user specialization')
    .populate('patient.user doctor.user', 'firstName lastName avatar')
    .populate('consultation', 'consultationId diagnosis');

  if (!prescription) {
    return next(new AppError('Prescription not found', 404));
  }

  // Check access permissions
  const hasAccess = 
    prescription.patient.user._id.toString() === req.user._id.toString() ||
    prescription.doctor.user._id.toString() === req.user._id.toString() ||
    req.user.role === 'admin';

  if (!hasAccess) {
    return next(new AppError('Access denied to this prescription', 403));
  }

  res.status(200).json({
    status: 'success',
    data: {
      prescription
    }
  });
});

// Update prescription
const updatePrescription = catchAsync(async (req, res, next) => {
  const prescription = await Prescription.findById(req.params.id);

  if (!prescription) {
    return next(new AppError('Prescription not found', 404));
  }

  // Check if doctor owns this prescription
  const doctor = await Doctor.findOne({ user: req.user._id });
  if (prescription.doctor.toString() !== doctor._id.toString()) {
    return next(new AppError('Access denied to this prescription', 403));
  }

  const updatedPrescription = await Prescription.findByIdAndUpdate(
    req.params.id,
    req.body,
    { new: true, runValidators: true }
  ).populate('patient doctor');

  res.status(200).json({
    status: 'success',
    message: 'Prescription updated successfully',
    data: {
      prescription: updatedPrescription
    }
  });
});

// Delete prescription
const deletePrescription = catchAsync(async (req, res, next) => {
  const prescription = await Prescription.findById(req.params.id);

  if (!prescription) {
    return next(new AppError('Prescription not found', 404));
  }

  // Check if doctor owns this prescription
  const doctor = await Doctor.findOne({ user: req.user._id });
  if (prescription.doctor.toString() !== doctor._id.toString()) {
    return next(new AppError('Access denied to this prescription', 403));
  }

  await Prescription.findByIdAndDelete(req.params.id);

  res.status(200).json({
    status: 'success',
    message: 'Prescription deleted successfully'
  });
});

// Add medication to prescription
const addMedication = catchAsync(async (req, res, next) => {
  const prescription = await Prescription.findById(req.params.id);

  if (!prescription) {
    return next(new AppError('Prescription not found', 404));
  }

  prescription.medications.push(req.body);
  await prescription.save();

  res.status(201).json({
    status: 'success',
    message: 'Medication added successfully',
    data: {
      prescription
    }
  });
});

// Update medication in prescription
const updateMedication = catchAsync(async (req, res, next) => {
  const { id, medicationId } = req.params;

  const prescription = await Prescription.findById(id);
  if (!prescription) {
    return next(new AppError('Prescription not found', 404));
  }

  const medication = prescription.medications.id(medicationId);
  if (!medication) {
    return next(new AppError('Medication not found', 404));
  }

  Object.assign(medication, req.body);
  await prescription.save();

  res.status(200).json({
    status: 'success',
    message: 'Medication updated successfully',
    data: {
      medication
    }
  });
});

// Remove medication from prescription
const removeMedication = catchAsync(async (req, res, next) => {
  const { id, medicationId } = req.params;

  const prescription = await Prescription.findById(id);
  if (!prescription) {
    return next(new AppError('Prescription not found', 404));
  }

  prescription.medications.id(medicationId).remove();
  await prescription.save();

  res.status(200).json({
    status: 'success',
    message: 'Medication removed successfully'
  });
});

// Discontinue prescription
const discontinuePrescription = catchAsync(async (req, res, next) => {
  const { reason } = req.body;

  const prescription = await Prescription.findById(req.params.id);
  if (!prescription) {
    return next(new AppError('Prescription not found', 404));
  }

  prescription.status = 'discontinued';
  prescription.medications.forEach(medication => {
    medication.isActive = false;
    medication.discontinuedDate = new Date();
    medication.discontinuedReason = reason;
  });

  await prescription.save();

  res.status(200).json({
    status: 'success',
    message: 'Prescription discontinued successfully',
    data: {
      prescription
    }
  });
});

// Refill prescription
const refillPrescription = catchAsync(async (req, res, next) => {
  const prescription = await Prescription.findById(req.params.id);

  if (!prescription) {
    return next(new AppError('Prescription not found', 404));
  }

  if (prescription.refills.remaining <= 0) {
    return next(new AppError('No refills remaining', 400));
  }

  prescription.refills.remaining -= 1;
  prescription.refills.lastRefillDate = new Date();

  await prescription.save();

  res.status(200).json({
    status: 'success',
    message: 'Prescription refilled successfully',
    data: {
      prescription
    }
  });
});

// Generate prescription PDF
const generatePrescriptionPDF = catchAsync(async (req, res, next) => {
  const prescription = await Prescription.findById(req.params.id)
    .populate('patient', 'user patientId dateOfBirth gender')
    .populate('doctor', 'user specialization licenseNumber')
    .populate('patient.user doctor.user', 'firstName lastName');

  if (!prescription) {
    return next(new AppError('Prescription not found', 404));
  }

  // Here you would implement PDF generation logic
  // For now, return prescription data
  res.status(200).json({
    status: 'success',
    message: 'PDF generation not implemented yet',
    data: {
      prescription
    }
  });
});

// Record medication adherence
const recordAdherence = catchAsync(async (req, res, next) => {
  const { medicationName, taken, missedReason } = req.body;

  const prescription = await Prescription.findById(req.params.id);
  if (!prescription) {
    return next(new AppError('Prescription not found', 404));
  }

  if (!taken && missedReason) {
    prescription.adherence.missedDoses.push({
      medicationName,
      missedDate: new Date(),
      reason: missedReason
    });
  }

  // Calculate adherence rate (simplified)
  const totalDoses = prescription.medications.length * 30; // Assuming 30 days
  const missedDoses = prescription.adherence.missedDoses.length;
  prescription.adherence.adherenceRate = ((totalDoses - missedDoses) / totalDoses) * 100;

  await prescription.save();

  res.status(200).json({
    status: 'success',
    message: 'Adherence recorded successfully',
    data: {
      adherenceRate: prescription.adherence.adherenceRate
    }
  });
});

// Get adherence report
const getAdherenceReport = catchAsync(async (req, res, next) => {
  const prescription = await Prescription.findById(req.params.id)
    .populate('patient', 'user patientId')
    .populate('patient.user', 'firstName lastName');

  if (!prescription) {
    return next(new AppError('Prescription not found', 404));
  }

  res.status(200).json({
    status: 'success',
    data: {
      adherence: prescription.adherence,
      patient: prescription.patient,
      medications: prescription.medications
    }
  });
});

module.exports = {
  getPrescriptions,
  createPrescription,
  getPrescriptionById,
  updatePrescription,
  deletePrescription,
  addMedication,
  updateMedication,
  removeMedication,
  discontinuePrescription,
  refillPrescription,
  generatePrescriptionPDF,
  recordAdherence,
  getAdherenceReport
};