const MedicalRecord = require("../models/MedicalRecord");
const Patient = require("../models/Patient");
const Doctor = require("../models/Doctor");
const { AppError } = require("../utils/appError");
const { catchAsync } = require("../utils/catchAsync");

// Get medical records
const getMedicalRecords = catchAsync(async (req, res, next) => {
  const {
    page = 1,
    limit = 20,
    recordType,
    patientId,
    startDate,
    endDate,
    search,
    bodyPart,
    testType,
  } = req.query;

  let query = {};

  // Filter based on user role
  if (req.user.role === "patient") {
    const patient = await Patient.findOne({ user: req.user._id });
    if (!patient) {
      return next(new AppError("Patient profile not found", 404));
    }
    query.patient = patient._id;
  } else if (req.user.role === "doctor") {
    const doctor = await Doctor.findOne({ user: req.user._id });
    if (!doctor) {
      return next(new AppError("Doctor profile not found", 404));
    }
    query.doctor = doctor._id;
  } else if (req.user.role === "secretary") {
    const secretary = await Secretary.findOne({ user: req.user._id });
    if (secretary) {
      query.doctor = secretary.doctor;
    }
  }

  // Apply filters
  if (recordType) query.recordType = recordType;
  if (patientId) query.patient = patientId;
  if (bodyPart)
    query["imagingResults.bodyPart"] = { $regex: bodyPart, $options: "i" };
  if (testType) query["labResults.testType"] = testType;

  // Date range filter
  if (startDate || endDate) {
    query.createdAt = {};
    if (startDate) query.createdAt.$gte = new Date(startDate);
    if (endDate) query.createdAt.$lte = new Date(endDate);
  }

  // Search filter
  if (search) {
    query.$or = [
      { title: { $regex: search, $options: "i" } },
      { description: { $regex: search, $options: "i" } },
      { "labResults.testName": { $regex: search, $options: "i" } },
      { "imagingResults.imagingType": { $regex: search, $options: "i" } },
      { "imagingResults.bodyPart": { $regex: search, $options: "i" } },
    ];
  }

  const records = await MedicalRecord.find(query)
    .populate("patient", "user patientId")
    .populate("doctor", "user specialization")
    .populate("consultation", "consultationId")
    .populate("patient.user doctor.user", "firstName lastName avatar")
    .sort({ createdAt: -1 })
    .limit(limit * 1)
    .skip((page - 1) * limit);

  const total = await MedicalRecord.countDocuments(query);

  res.status(200).json({
    status: "success",
    results: records.length,
    pagination: {
      page: parseInt(page),
      limit: parseInt(limit),
      total,
      pages: Math.ceil(total / limit),
    },
    data: {
      records,
    },
  });
});

// Create medical record
const createMedicalRecord = catchAsync(async (req, res, next) => {
  const {
    patientId,
    consultationId,
    recordType,
    title,
    description,
    labResults,
    imagingResults,
    procedureRecord,
  } = req.body;

  const doctor = await Doctor.findOne({ user: req.user._id });
  if (!doctor) {
    return next(new AppError("Doctor profile not found", 404));
  }

  const record = await MedicalRecord.create({
    patient: patientId,
    doctor: doctor._id,
    consultation: consultationId,
    recordType,
    title,
    description,
    labResults,
    imagingResults,
    procedureRecord,
    status: "final",
  });

  await record.populate("patient doctor consultation");
  await record.populate("patient.user doctor.user", "firstName lastName");

  res.status(201).json({
    status: "success",
    message: "Medical record created successfully",
    data: {
      record,
    },
  });
});

// Get medical record by ID
const getMedicalRecordById = catchAsync(async (req, res, next) => {
  const record = await MedicalRecord.findById(req.params.id)
    .populate("patient", "user patientId")
    .populate("doctor", "user specialization")
    .populate("consultation", "consultationId diagnosis")
    .populate("patient.user doctor.user", "firstName lastName avatar");

  if (!record) {
    return next(new AppError("Medical record not found", 404));
  }

  // Check access permissions
  const hasAccess =
    record.patient.user._id.toString() === req.user._id.toString() ||
    record.doctor.user._id.toString() === req.user._id.toString() ||
    record.sharedWith.some(
      (share) => share.user.toString() === req.user._id.toString()
    ) ||
    req.user.role === "admin";

  if (!hasAccess) {
    return next(new AppError("Access denied to this medical record", 403));
  }

  // Log access
  record.accessLog.push({
    user: req.user._id,
    action: "view",
    timestamp: new Date(),
    ipAddress: req.ip,
  });

  await record.save();

  res.status(200).json({
    status: "success",
    data: {
      record,
    },
  });
});

// Update medical record
const updateMedicalRecord = catchAsync(async (req, res, next) => {
  const record = await MedicalRecord.findById(req.params.id);

  if (!record) {
    return next(new AppError("Medical record not found", 404));
  }

  // Store previous version
  record.previousVersions.push({
    version: record.version,
    data: record.toObject(),
    modifiedAt: new Date(),
    modifiedBy: req.user._id,
    reason: req.body.updateReason || "Record update",
  });

  // Update record
  Object.assign(record, req.body);
  record.version += 1;

  await record.save();

  res.status(200).json({
    status: "success",
    message: "Medical record updated successfully",
    data: {
      record,
    },
  });
});

// Delete medical record
const deleteMedicalRecord = catchAsync(async (req, res, next) => {
  const record = await MedicalRecord.findByIdAndDelete(req.params.id);

  if (!record) {
    return next(new AppError("Medical record not found", 404));
  }

  res.status(200).json({
    status: "success",
    message: "Medical record deleted successfully",
  });
});

// Add attachments
const addAttachments = catchAsync(async (req, res, next) => {
  if (!req.files || req.files.length === 0) {
    return next(new AppError("No files uploaded", 400));
  }

  const record = await MedicalRecord.findById(req.params.id);
  if (!record) {
    return next(new AppError("Medical record not found", 404));
  }

  const attachments = req.files.map((file) => ({
    filename: file.filename,
    originalName: file.originalname,
    mimetype: file.mimetype,
    size: file.size,
    url: file.path,
    uploadedAt: new Date(),
    uploadedBy: req.user._id,
  }));

  record.attachments.push(...attachments);
  await record.save();

  res.status(200).json({
    status: "success",
    message: "Attachments added successfully",
    data: {
      attachments,
    },
  });
});

// Remove attachment
const removeAttachment = catchAsync(async (req, res, next) => {
  const { id, attachmentId } = req.params;

  const record = await MedicalRecord.findById(id);
  if (!record) {
    return next(new AppError("Medical record not found", 404));
  }

  record.attachments.id(attachmentId).remove();
  await record.save();

  res.status(200).json({
    status: "success",
    message: "Attachment removed successfully",
  });
});

// Share record
const shareRecord = catchAsync(async (req, res, next) => {
  const { userId, permissions } = req.body;

  const record = await MedicalRecord.findById(req.params.id);
  if (!record) {
    return next(new AppError("Medical record not found", 404));
  }

  record.sharedWith.push({
    user: userId,
    permissions: permissions || { view: true, download: false },
    sharedAt: new Date(),
    sharedBy: req.user._id,
  });

  await record.save();

  res.status(200).json({
    status: "success",
    message: "Record shared successfully",
  });
});

// Revoke access
const revokeAccess = catchAsync(async (req, res, next) => {
  const { id, userId } = req.params;

  const record = await MedicalRecord.findById(id);
  if (!record) {
    return next(new AppError("Medical record not found", 404));
  }

  record.sharedWith = record.sharedWith.filter(
    (share) => share.user.toString() !== userId
  );

  await record.save();

  res.status(200).json({
    status: "success",
    message: "Access revoked successfully",
  });
});

// Get access log
const getAccessLog = catchAsync(async (req, res, next) => {
  const record = await MedicalRecord.findById(req.params.id)
    .populate("accessLog.user", "firstName lastName role")
    .select("accessLog");

  if (!record) {
    return next(new AppError("Medical record not found", 404));
  }

  res.status(200).json({
    status: "success",
    data: {
      accessLog: record.accessLog,
    },
  });
});

// Get record types
const getRecordTypes = catchAsync(async (req, res, next) => {
  const recordTypes = [
    "lab-result",
    "imaging",
    "prescription",
    "consultation-note",
    "vital-signs",
    "procedure",
    "discharge-summary",
  ];

  res.status(200).json({
    status: "success",
    data: {
      recordTypes,
    },
  });
});

// Add lab results
const addLabResults = catchAsync(async (req, res, next) => {
  const {
    patientId,
    testName,
    testType,
    results,
    interpretation,
    recommendations,
  } = req.body;

  const doctor = await Doctor.findOne({ user: req.user._id });
  if (!doctor) {
    return next(new AppError("Doctor profile not found", 404));
  }

  const record = await MedicalRecord.create({
    patient: patientId,
    doctor: doctor._id,
    recordType: "lab-result",
    title: `${testName} - Lab Results`,
    labResults: {
      testName,
      testType,
      results,
      interpretation,
      recommendations,
    },
    status: "final",
  });

  res.status(201).json({
    status: "success",
    message: "Lab results added successfully",
    data: {
      record,
    },
  });
});

// Get lab results for patient
const getLabResults = catchAsync(async (req, res, next) => {
  const { patientId } = req.params;
  const { testType, startDate, endDate } = req.query;

  let query = {
    patient: patientId,
    recordType: "lab-result",
  };

  if (testType) {
    query["labResults.testType"] = testType;
  }

  if (startDate || endDate) {
    query.createdAt = {};
    if (startDate) query.createdAt.$gte = new Date(startDate);
    if (endDate) query.createdAt.$lte = new Date(endDate);
  }

  const labResults = await MedicalRecord.find(query)
    .populate("doctor", "user specialization")
    .populate("doctor.user", "firstName lastName")
    .sort({ createdAt: -1 });

  res.status(200).json({
    status: "success",
    results: labResults.length,
    data: {
      labResults,
    },
  });
});

// Add imaging results
const addImagingResults = catchAsync(async (req, res, next) => {
  const {
    patientId,
    imagingType,
    bodyPart,
    findings,
    impression,
    recommendations,
  } = req.body;

  const doctor = await Doctor.findOne({ user: req.user._id });
  if (!doctor) {
    return next(new AppError("Doctor profile not found", 404));
  }

  const record = await MedicalRecord.create({
    patient: patientId,
    doctor: doctor._id,
    recordType: "imaging",
    title: `${imagingType} - ${bodyPart}`,
    imagingResults: {
      imagingType,
      bodyPart,
      findings,
      impression,
      recommendations,
    },
    status: "final",
  });

  res.status(201).json({
    status: "success",
    message: "Imaging results added successfully",
    data: {
      record,
    },
  });
});

// Get imaging results for patient
const getImagingResults = catchAsync(async (req, res, next) => {
  const { patientId } = req.params;
  const { imagingType, bodyPart, startDate, endDate } = req.query;

  let query = {
    patient: patientId,
    recordType: "imaging",
  };

  if (imagingType) {
    query["imagingResults.imagingType"] = imagingType;
  }

  if (bodyPart) {
    query["imagingResults.bodyPart"] = { $regex: bodyPart, $options: "i" };
  }

  if (startDate || endDate) {
    query.createdAt = {};
    if (startDate) query.createdAt.$gte = new Date(startDate);
    if (endDate) query.createdAt.$lte = new Date(endDate);
  }

  const imagingResults = await MedicalRecord.find(query)
    .populate("doctor", "user specialization")
    .populate("doctor.user", "firstName lastName")
    .sort({ createdAt: -1 });

  res.status(200).json({
    status: "success",
    results: imagingResults.length,
    data: {
      imagingResults,
    },
  });
});

// module.exports = {
//   getMedicalRecords,
//   createMedicalRecord,
//   getMedicalRecordById,
//   updateMedicalRecord,
//   deleteMedicalRecord,
//   addAttachments,
//   removeAttachment,
//   shareRecord,
//   revokeAccess,
//   getAccessLog,
//   getRecordTypes,
//   addLabResults,
//   getLabResults,
//   addImagingResults,
//   getImagingResults,
// };

// Get X-ray records specifically
const getXRayRecords = catchAsync(async (req, res, next) => {
  const { bodyPart, patientId } = req.query;

  let query = {
    recordType: "imaging",
    "imagingResults.imagingType": "x-ray",
  };

  // Filter based on user role
  if (req.user.role === "patient") {
    const patient = await Patient.findOne({ user: req.user._id });
    if (!patient) {
      return next(new AppError("Patient profile not found", 404));
    }
    query.patient = patient._id;
  } else if (req.user.role === "doctor") {
    const doctor = await Doctor.findOne({ user: req.user._id });
    if (!doctor) {
      return next(new AppError("Doctor profile not found", 404));
    }
    query.doctor = doctor._id;
  }

  if (patientId) query.patient = patientId;
  if (bodyPart)
    query["imagingResults.bodyPart"] = { $regex: bodyPart, $options: "i" };

  const records = await MedicalRecord.find(query)
    .populate("patient", "user patientId")
    .populate("doctor", "user specialization")
    .populate("patient.user doctor.user", "firstName lastName avatar")
    .sort({ createdAt: -1 });

  res.status(200).json({
    status: "success",
    results: records.length,
    data: {
      records,
    },
  });
});

// Get blood test records specifically
const getBloodTestRecords = catchAsync(async (req, res, next) => {
  const { testType, patientId } = req.query;

  let query = {
    recordType: "lab-result",
    "labResults.testType": "blood",
  };

  // Filter based on user role
  if (req.user.role === "patient") {
    const patient = await Patient.findOne({ user: req.user._id });
    if (!patient) {
      return next(new AppError("Patient profile not found", 404));
    }
    query.patient = patient._id;
  } else if (req.user.role === "doctor") {
    const doctor = await Doctor.findOne({ user: req.user._id });
    if (!doctor) {
      return next(new AppError("Doctor profile not found", 404));
    }
    query.doctor = doctor._id;
  }

  if (patientId) query.patient = patientId;
  if (testType)
    query["labResults.testName"] = { $regex: testType, $options: "i" };

  const records = await MedicalRecord.find(query)
    .populate("patient", "user patientId")
    .populate("doctor", "user specialization")
    .populate("patient.user doctor.user", "firstName lastName avatar")
    .sort({ createdAt: -1 });

  res.status(200).json({
    status: "success",
    results: records.length,
    data: {
      records,
    },
  });
});

// Export the functions properly
module.exports = {
  getMedicalRecords,
  createMedicalRecord,
  getMedicalRecordById,
  updateMedicalRecord,
  deleteMedicalRecord,
  addAttachments,
  removeAttachment,
  shareRecord,
  revokeAccess,
  getAccessLog,
  getRecordTypes,
  addLabResults,
  getLabResults,
  addImagingResults,
  getImagingResults,
  getXRayRecords,
  getBloodTestRecords,
};
