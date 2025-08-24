const Patient = require('../models/Patient');
const Doctor = require('../models/Doctor');
const User = require('../models/User');
const MedicalRecord = require('../models/MedicalRecord');
const Prescription = require('../models/Prescription');
const { AppError } = require('../utils/appError');
const { catchAsync } = require('../utils/catchAsync');

// Get patient profile
const getPatientProfile = catchAsync(async (req, res, next) => {
  const patient = await Patient.findOne({ user: req.user._id })
    .populate('user', 'firstName lastName avatar email phoneNumber')
    .populate('doctors.doctor', 'user specialization consultationFee')
    .populate('doctors.doctor.user', 'firstName lastName avatar');

  if (!patient) {
    return next(new AppError('Patient profile not found', 404));
  }

  res.status(200).json({
    status: 'success',
    data: {
      patient
    }
  });
});

// Update patient profile
const updatePatientProfile = catchAsync(async (req, res, next) => {
  const patient = await Patient.findOneAndUpdate(
    { user: req.user._id },
    req.body,
    { new: true, runValidators: true }
  ).populate('user', 'firstName lastName avatar email phoneNumber');

  if (!patient) {
    return next(new AppError('Patient profile not found', 404));
  }

  res.status(200).json({
    status: 'success',
    message: 'Patient profile updated successfully',
    data: {
      patient
    }
  });
});

// Get patient's doctors
const getPatientDoctors = catchAsync(async (req, res, next) => {
  const patient = await Patient.findOne({ user: req.user._id })
    .populate({
      path: 'doctors.doctor',
      populate: {
        path: 'user',
        select: 'firstName lastName avatar email phoneNumber'
      }
    });

  if (!patient) {
    return next(new AppError('Patient profile not found', 404));
  }

  res.status(200).json({
    status: 'success',
    data: {
      doctors: patient.doctors
    }
  });
});

// Get medical history
const getMedicalHistory = catchAsync(async (req, res, next) => {
  const patient = await Patient.findOne({ user: req.user._id })
    .select('medicalHistory');

  if (!patient) {
    return next(new AppError('Patient profile not found', 404));
  }

  res.status(200).json({
    status: 'success',
    data: {
      medicalHistory: patient.medicalHistory
    }
  });
});

// Update medical history
const updateMedicalHistory = catchAsync(async (req, res, next) => {
  const patient = await Patient.findOneAndUpdate(
    { user: req.user._id },
    { medicalHistory: req.body },
    { new: true, runValidators: true }
  ).select('medicalHistory');

  if (!patient) {
    return next(new AppError('Patient profile not found', 404));
  }

  res.status(200).json({
    status: 'success',
    message: 'Medical history updated successfully',
    data: {
      medicalHistory: patient.medicalHistory
    }
  });
});

// Get current medications
const getCurrentMedications = catchAsync(async (req, res, next) => {
  const patient = await Patient.findOne({ user: req.user._id })
    .populate({
      path: 'currentMedications.medication',
      populate: {
        path: 'doctor',
        populate: {
          path: 'user',
          select: 'firstName lastName'
        }
      }
    });

  if (!patient) {
    return next(new AppError('Patient profile not found', 404));
  }

  // Filter active medications
  const activeMedications = patient.currentMedications.filter(med => med.isActive);

  res.status(200).json({
    status: 'success',
    data: {
      medications: activeMedications
    }
  });
});

// Get vital signs
const getVitalSigns = catchAsync(async (req, res, next) => {
  const { startDate, endDate, limit = 50 } = req.query;

  const patient = await Patient.findOne({ user: req.user._id });
  if (!patient) {
    return next(new AppError('Patient profile not found', 404));
  }

  let vitalSigns = patient.vitalSigns;

  // Apply date filters
  if (startDate || endDate) {
    vitalSigns = vitalSigns.filter(vital => {
      const vitalDate = vital.date;
      if (startDate && vitalDate < new Date(startDate)) return false;
      if (endDate && vitalDate > new Date(endDate)) return false;
      return true;
    });
  }

  // Sort by date (newest first) and limit
  vitalSigns = vitalSigns
    .sort((a, b) => b.date - a.date)
    .slice(0, parseInt(limit));

  res.status(200).json({
    status: 'success',
    data: {
      vitalSigns
    }
  });
});

// Add vital signs
const addVitalSigns = catchAsync(async (req, res, next) => {
  const { patientId } = req.body;
  
  // Determine which patient to update
  let patient;
  if (req.user.role === 'patient') {
    patient = await Patient.findOne({ user: req.user._id });
  } else {
    patient = await Patient.findById(patientId);
  }

  if (!patient) {
    return next(new AppError('Patient not found', 404));
  }

  const vitalSigns = {
    ...req.body,
    date: new Date(),
    recordedBy: req.user._id
  };

  patient.vitalSigns.push(vitalSigns);
  await patient.save();

  res.status(201).json({
    status: 'success',
    message: 'Vital signs added successfully',
    data: {
      vitalSigns: patient.vitalSigns[patient.vitalSigns.length - 1]
    }
  });
});

// Get patients (for doctors/secretaries)
const getPatients = catchAsync(async (req, res, next) => {
  const {
    page = 1,
    limit = 20,
    search,
    gender,
    ageMin,
    ageMax,
    status
  } = req.query;

  let query = {};

  // For doctors, only show their connected patients
  if (req.user.role === 'doctor') {
    const doctor = await Doctor.findOne({ user: req.user._id });
    if (!doctor) {
      return next(new AppError('Doctor profile not found', 404));
    }
    const patientIds = doctor.patients
      .filter(p => p.status === 'active')
      .map(p => p.patient);
    query._id = { $in: patientIds };
  } else if (req.user.role === 'secretary') {
    const secretary = await Secretary.findOne({ user: req.user._id });
    if (secretary) {
      const doctor = await Doctor.findById(secretary.doctor);
      if (doctor) {
        const patientIds = doctor.patients
          .filter(p => p.status === 'active')
          .map(p => p.patient);
        query._id = { $in: patientIds };
      }
    }
  }

  // Apply filters
  if (gender) query.gender = gender;
  if (status) query['doctors.status'] = status;

  const patients = await Patient.find(query)
    .populate('user', 'firstName lastName avatar email phoneNumber')
    .sort({ createdAt: -1 })
    .limit(limit * 1)
    .skip((page - 1) * limit);

  // Filter by age if specified
  let filteredPatients = patients;
  if (ageMin || ageMax) {
    filteredPatients = patients.filter(patient => {
      const age = patient.age;
      if (!age) return true; // Include patients without age data
      if (ageMin && age < parseInt(ageMin)) return false;
      if (ageMax && age > parseInt(ageMax)) return false;
      return true;
    });
  }

  // Search filter
  if (search) {
    filteredPatients = filteredPatients.filter(patient => 
      patient.user.firstName.toLowerCase().includes(search.toLowerCase()) ||
      patient.user.lastName.toLowerCase().includes(search.toLowerCase()) ||
      patient.patientId.toLowerCase().includes(search.toLowerCase())
    );
  }

  const total = await Patient.countDocuments(query);

  res.status(200).json({
    status: 'success',
    results: filteredPatients.length,
    pagination: {
      page: parseInt(page),
      limit: parseInt(limit),
      total,
      pages: Math.ceil(total / limit)
    },
    data: {
      patients: filteredPatients
    }
  });
});

// Get patient by ID
const getPatientById = catchAsync(async (req, res, next) => {
  const patient = await Patient.findById(req.params.id)
    .populate('user', 'firstName lastName avatar email phoneNumber')
    .populate('doctors.doctor', 'user specialization')
    .populate('doctors.doctor.user', 'firstName lastName');

  if (!patient) {
    return next(new AppError('Patient not found', 404));
  }

  res.status(200).json({
    status: 'success',
    data: {
      patient
    }
  });
});

// Update patient (doctor/secretary)
const updatePatient = catchAsync(async (req, res, next) => {
  const patient = await Patient.findByIdAndUpdate(
    req.params.id,
    req.body,
    { new: true, runValidators: true }
  ).populate('user', 'firstName lastName avatar email phoneNumber');

  if (!patient) {
    return next(new AppError('Patient not found', 404));
  }

  res.status(200).json({
    status: 'success',
    message: 'Patient updated successfully',
    data: {
      patient
    }
  });
});

// Accept patient connection (doctor)
const acceptPatientConnection = catchAsync(async (req, res, next) => {
  const patientId = req.params.id;

  const doctor = await Doctor.findOne({ user: req.user._id });
  if (!doctor) {
    return next(new AppError('Doctor profile not found', 404));
  }

  const patient = await Patient.findById(patientId);
  if (!patient) {
    return next(new AppError('Patient not found', 404));
  }

  // Update connection status in both doctor and patient records
  const doctorPatient = doctor.patients.find(p => p.patient.toString() === patientId);
  const patientDoctor = patient.doctors.find(d => d.doctor.toString() === doctor._id.toString());

  if (!doctorPatient || !patientDoctor) {
    return next(new AppError('Connection request not found', 404));
  }

  doctorPatient.status = 'active';
  patientDoctor.status = 'active';

  await doctor.save();
  await patient.save();

  // Update statistics
  doctor.statistics.totalPatients = doctor.patients.filter(p => p.status === 'active').length;
  await doctor.save();

  res.status(200).json({
    status: 'success',
    message: 'Patient connection accepted successfully'
  });
});

// Disconnect patient (doctor)
const disconnectPatient = catchAsync(async (req, res, next) => {
  const patientId = req.params.id;

  const doctor = await Doctor.findOne({ user: req.user._id });
  if (!doctor) {
    return next(new AppError('Doctor profile not found', 404));
  }

  // Remove from doctor's patients list
  doctor.patients = doctor.patients.filter(
    p => p.patient.toString() !== patientId
  );

  // Remove from patient's doctors list
  await Patient.findByIdAndUpdate(patientId, {
    $pull: { doctors: { doctor: doctor._id } }
  });

  await doctor.save();

  res.status(200).json({
    status: 'success',
    message: 'Patient disconnected successfully'
  });
});

module.exports = {
  getPatientProfile,
  updatePatientProfile,
  getPatientDoctors,
  getMedicalHistory,
  updateMedicalHistory,
  getCurrentMedications,
  getVitalSigns,
  addVitalSigns,
  getPatients,
  getPatientById,
  updatePatient,
  acceptPatientConnection,
  disconnectPatient
};