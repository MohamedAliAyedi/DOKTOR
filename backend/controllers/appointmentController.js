const { validationResult } = require("express-validator");
const Appointment = require("../models/Appointment");
const Doctor = require("../models/Doctor");
const Patient = require("../models/Patient");
const User = require("../models/User");
const Notification = require("../models/Notification");
const { AppError } = require("../utils/appError");
const { catchAsync } = require("../utils/catchAsync");
const emailService = require("../utils/email");
const smsService = require("../utils/sms");

// Get appointments with filtering and pagination
const getAppointments = catchAsync(async (req, res, next) => {
  const {
    page = 1,
    limit = 20,
    status,
    appointmentType,
    startDate,
    endDate,
    doctorId,
    patientId,
    search,
  } = req.query;

  // Build query based on user role
  let query = {};

  if (req.user.role === "patient") {
    const patient = await Patient.findOne({ user: req.user._id });
    query.patient = patient._id;
  } else if (req.user.role === "doctor") {
    const doctor = await Doctor.findOne({ user: req.user._id });
    query.doctor = doctor._id;
  } else if (req.user.role === "secretary") {
    // Secretary can see appointments for their assigned doctor
    const secretary = await Secretary.findOne({ user: req.user._id });
    if (secretary) {
      query.doctor = secretary.doctor;
    }
  }

  // Apply filters
  if (status) query.status = status;
  if (appointmentType) query.appointmentType = appointmentType;
  if (doctorId) query.doctor = doctorId;
  if (patientId) query.patient = patientId;

  // Date range filter
  if (startDate || endDate) {
    query.scheduledDate = {};
    if (startDate) query.scheduledDate.$gte = new Date(startDate);
    if (endDate) query.scheduledDate.$lte = new Date(endDate);
  }

  // Search functionality
  if (search) {
    // This would require text indexes on relevant fields
    query.$text = { $search: search };
  }

  const appointments = await Appointment.find(query)
    .populate("patient", "user patientId")
    .populate("doctor", "user specialization")
    .populate("patient.user", "firstName lastName avatar")
    .populate("doctor.user", "firstName lastName avatar")
    .populate("consultation")
    .populate("billing")
    .sort({ scheduledDate: 1, "scheduledTime.start": 1 })
    .limit(limit * 1)
    .skip((page - 1) * limit);

  const total = await Appointment.countDocuments(query);

  res.status(200).json({
    status: "success",
    results: appointments.length,
    pagination: {
      page: parseInt(page),
      limit: parseInt(limit),
      total,
      pages: Math.ceil(total / limit),
    },
    data: {
      appointments,
    },
  });
});

// Create new appointment
const createAppointment = catchAsync(async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return next(new AppError("Validation failed", 400, errors.array()));
  }

  let {
    doctorId,
    appointmentType,
    scheduledDate,
    scheduledTime,
    duration,
    reason,
    symptoms,
    priority = "normal",
  } = req.body;

  // Parse scheduledDate - handle multiple formats with better validation
  if (typeof scheduledDate === "string") {
    // Handle DD/MM/YYYY format
    if (/^\d{1,2}\/\d{1,2}\/\d{4}$/.test(scheduledDate)) {
      const [day, month, year] = scheduledDate.split("/");
      scheduledDate = new Date(
        parseInt(year),
        parseInt(month) - 1,
        parseInt(day)
      );
    }
    // Handle YYYY-MM-DD format
    else if (/^\d{4}-\d{1,2}-\d{1,2}$/.test(scheduledDate)) {
      scheduledDate = new Date(scheduledDate);
    }
    // Handle other ISO formats
    else {
      scheduledDate = new Date(scheduledDate);
    }
  } else {
    scheduledDate = new Date(scheduledDate);
  }

  if (isNaN(scheduledDate.getTime())) {
    return next(new AppError("Invalid scheduledDate format", 400));
  }

  // Ensure the date is not in the past (except for same day)
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  if (scheduledDate < today) {
    return next(new AppError("Cannot schedule appointments in the past", 400));
  }
  // Validate scheduledTime
  if (!scheduledTime?.start || !scheduledTime?.end) {
    return next(new AppError("scheduledTime must have start and end", 400));
  }

  // Validate time format
  const timeRegex = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/;
  if (
    !timeRegex.test(scheduledTime.start) ||
    !timeRegex.test(scheduledTime.end)
  ) {
    return next(new AppError("Invalid time format. Use HH:MM format", 400));
  }

  // Ensure end is after start
  const startTime = new Date(`2000-01-01T${scheduledTime.start}:00`);
  const endTime = new Date(`2000-01-01T${scheduledTime.end}:00`);
  if (endTime <= startTime) {
    return next(
      new AppError("scheduledTime.end must be after scheduledTime.start", 400)
    );
  }

  // Calculate duration if not provided
  if (!duration) {
    duration = (endTime - startTime) / (1000 * 60); // in minutes
  }

  // Get patient profile
  const patient = await Patient.findOne({ user: req.user._id });
  if (!patient) {
    return next(new AppError("Patient profile not found", 404));
  }

  // Verify doctor exists
  const doctor = await Doctor.findById(doctorId);
  if (!doctor) {
    return next(new AppError("Doctor not found", 404));
  }

  // Check if patient is connected to this doctor
  const isConnected = patient.doctors.some(
    (d) => d.doctor.toString() === doctorId && d.status === "active"
  );
  // Allow booking even if not connected - connection will be created

  // Check for scheduling conflicts
  const appointmentDate = new Date(scheduledDate);
  const startOfDay = new Date(
    appointmentDate.getFullYear(),
    appointmentDate.getMonth(),
    appointmentDate.getDate()
  );
  const endOfDay = new Date(
    appointmentDate.getFullYear(),
    appointmentDate.getMonth(),
    appointmentDate.getDate(),
    23,
    59,
    59
  );

  const conflictingAppointment = await Appointment.findOne({
    doctor: doctorId,
    scheduledDate: {
      $gte: startOfDay,
      $lte: endOfDay,
    },
    status: { $in: ["scheduled", "confirmed", "in-progress"] },
    $and: [
      { "scheduledTime.start": { $lt: scheduledTime.end } },
      { "scheduledTime.end": { $gt: scheduledTime.start } },
    ],
  });

  if (conflictingAppointment) {
    return next(new AppError("Time slot is not available", 409));
  }

  // If not connected, create connection automatically
  if (!isConnected) {
    patient.doctors.push({
      doctor: doctorId,
      status: "active",
      connectedAt: new Date(),
      isPrimary: patient.doctors.length === 0,
    });

    doctor.patients.push({
      patient: patient._id,
      status: "active",
      connectedAt: new Date(),
    });

    await patient.save();
    await doctor.save();
  }
  // Generate unique appointment ID
  const appointmentId = `appt_${Date.now()}`;

  // Create appointment
  const appointment = await Appointment.create({
    appointmentId,
    patient: patient._id,
    doctor: doctorId,
    appointmentType,
    scheduledDate,
    scheduledTime,
    duration,
    reason,
    symptoms: symptoms || [],
    priority,
    createdBy: req.user._id,
  });

  await appointment.populate("patient doctor");
  await appointment.populate(
    "patient.user doctor.user",
    "firstName lastName email phoneNumber"
  );

  // Send confirmation notifications
  try {
    await emailService.sendAppointmentConfirmation(appointment);

    await Notification.create({
      recipient: doctor.user,
      sender: req.user._id,
      type: "appointment-confirmation",
      title: "New Appointment Booked",
      message: `${
        req.user.fullName
      } has booked an appointment for ${scheduledDate.toLocaleDateString()}`,
      relatedEntities: { appointment: appointment._id },
    });
  } catch (error) {
    console.error("Failed to send appointment notifications:", error);
  }

  res.status(201).json({
    status: "success",
    message: "Appointment created successfully",
    data: { appointment },
  });
});

// Get appointment by ID
const getAppointmentById = catchAsync(async (req, res, next) => {
  const appointment = await Appointment.findById(req.params.id)
    .populate("patient", "user patientId dateOfBirth gender")
    .populate("doctor", "user specialization consultationFee")
    .populate(
      "patient.user doctor.user",
      "firstName lastName avatar email phoneNumber"
    )
    .populate("consultation")
    .populate("billing");

  if (!appointment) {
    return next(new AppError("Appointment not found", 404));
  }

  // Check access permissions
  const hasAccess =
    appointment.patient.user._id.toString() === req.user._id.toString() ||
    appointment.doctor.user._id.toString() === req.user._id.toString() ||
    req.user.role === "admin";

  if (!hasAccess) {
    return next(new AppError("Access denied to this appointment", 403));
  }

  res.status(200).json({
    status: "success",
    data: {
      appointment,
    },
  });
});

// Update appointment
const updateAppointment = catchAsync(async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return next(new AppError("Validation failed", 400, errors.array()));
  }

  const appointment = await Appointment.findById(req.params.id);
  if (!appointment) {
    return next(new AppError("Appointment not found", 404));
  }

  // Check permissions
  const canUpdate =
    appointment.patient.toString() === req.user.patientProfile?.toString() ||
    appointment.doctor.toString() === req.user.doctorProfile?.toString() ||
    req.user.role === "secretary" ||
    req.user.role === "admin";

  if (!canUpdate) {
    return next(new AppError("Access denied to update this appointment", 403));
  }

  const updatedAppointment = await Appointment.findByIdAndUpdate(
    req.params.id,
    { ...req.body, updatedBy: req.user._id },
    { new: true, runValidators: true }
  ).populate("patient doctor");

  res.status(200).json({
    status: "success",
    message: "Appointment updated successfully",
    data: {
      appointment: updatedAppointment,
    },
  });
});

// Get doctor availability
const getDoctorAvailability = catchAsync(async (req, res, next) => {
  const { doctorId } = req.params;
  const { date, days = 7 } = req.query;

  const doctor = await Doctor.findById(doctorId);
  if (!doctor) {
    return next(new AppError("Doctor not found", 404));
  }

  const startDate = date ? new Date(date) : new Date();
  const endDate = new Date(startDate);
  endDate.setDate(endDate.getDate() + parseInt(days));

  // Get existing appointments
  const existingAppointments = await Appointment.find({
    doctor: doctorId,
    scheduledDate: { $gte: startDate, $lte: endDate },
    status: { $in: ["scheduled", "confirmed", "in-progress"] },
  }).select("scheduledDate scheduledTime duration");

  // Get doctor's unavailability periods
  const unavailabilityPeriods = doctor.unavailability.filter((period) => {
    const periodStart = new Date(period.startDate);
    const periodEnd = new Date(period.endDate);
    return periodStart <= endDate && periodEnd >= startDate;
  });

  res.status(200).json({
    status: "success",
    data: {
      doctorId,
      workingHours: doctor.workingHours,
      existingAppointments,
      unavailabilityPeriods,
      dateRange: {
        start: startDate,
        end: endDate,
      },
    },
  });
});

// Get calendar view
const getCalendarView = catchAsync(async (req, res, next) => {
  const { month, year, view = "month" } = req.query;

  let startDate, endDate;

  if (view === "month") {
    startDate = new Date(
      year || new Date().getFullYear(),
      (month || new Date().getMonth()) - 1,
      1
    );
    endDate = new Date(
      year || new Date().getFullYear(),
      month || new Date().getMonth(),
      0
    );
  } else if (view === "week") {
    // Implement week view logic
    startDate = new Date();
    endDate = new Date();
    endDate.setDate(endDate.getDate() + 7);
  } else {
    // Day view
    startDate = new Date();
    endDate = new Date();
    endDate.setDate(endDate.getDate() + 1);
  }

  let query = {
    scheduledDate: { $gte: startDate, $lte: endDate },
  };

  // Filter by user role
  if (req.user.role === "patient") {
    const patient = await Patient.findOne({ user: req.user._id });
    query.patient = patient._id;
  } else if (req.user.role === "doctor") {
    const doctor = await Doctor.findOne({ user: req.user._id });
    query.doctor = doctor._id;
  }

  const appointments = await Appointment.find(query)
    .populate("patient", "user patientId")
    .populate("doctor", "user specialization")
    .populate("patient.user doctor.user", "firstName lastName avatar")
    .sort({ scheduledDate: 1, "scheduledTime.start": 1 });

  res.status(200).json({
    status: "success",
    data: {
      appointments,
      view,
      dateRange: {
        start: startDate,
        end: endDate,
      },
    },
  });
});

// Get upcoming appointments
const getUpcomingAppointments = catchAsync(async (req, res, next) => {
  const { limit = 5 } = req.query;

  let query = {
    scheduledDate: { $gte: new Date() },
    status: { $in: ["scheduled", "confirmed"] },
  };

  if (req.user.role === "patient") {
    const patient = await Patient.findOne({ user: req.user._id });
    query.patient = patient._id;
  } else if (req.user.role === "doctor") {
    const doctor = await Doctor.findOne({ user: req.user._id });
    query.doctor = doctor._id;
  }

  const appointments = await Appointment.find(query)
    .populate("patient", "user patientId")
    .populate("doctor", "user specialization")
    .populate("patient.user doctor.user", "firstName lastName avatar")
    .sort({ scheduledDate: 1, "scheduledTime.start": 1 })
    .limit(parseInt(limit));

  res.status(200).json({
    status: "success",
    results: appointments.length,
    data: {
      appointments,
    },
  });
});

// Cancel appointment
const cancelAppointment = catchAsync(async (req, res, next) => {
  const { reason } = req.body;

  const appointment = await Appointment.findById(req.params.id)
    .populate("patient doctor")
    .populate("patient.user doctor.user");

  if (!appointment) {
    return next(new AppError("Appointment not found", 404));
  }

  // Check permissions
  const canCancel =
    appointment.patient.user._id.toString() === req.user._id.toString() ||
    appointment.doctor.user._id.toString() === req.user._id.toString() ||
    req.user.role === "secretary" ||
    req.user.role === "admin";

  if (!canCancel) {
    return next(new AppError("Access denied to cancel this appointment", 403));
  }

  if (appointment.status === "cancelled") {
    return next(new AppError("Appointment is already cancelled", 400));
  }

  appointment.status = "cancelled";
  appointment.cancellation = {
    cancelledAt: new Date(),
    cancelledBy: req.user._id,
    reason: reason || "No reason provided",
  };
  appointment.updatedBy = req.user._id;

  await appointment.save();

  // Send notifications
  const otherParticipant =
    appointment.patient.user._id.toString() === req.user._id.toString()
      ? appointment.doctor.user
      : appointment.patient.user;

  await Notification.create({
    recipient: otherParticipant._id,
    sender: req.user._id,
    type: "appointment-cancellation",
    title: "Appointment Cancelled",
    message: `Your appointment on ${appointment.scheduledDate.toLocaleDateString()} has been cancelled`,
    relatedEntities: {
      appointment: appointment._id,
    },
  });

  res.status(200).json({
    status: "success",
    message: "Appointment cancelled successfully",
    data: {
      appointment,
    },
  });
});

// Reschedule appointment
const rescheduleAppointment = catchAsync(async (req, res, next) => {
  const { newDate, newTime, reason } = req.body;

  if (!newDate || !newTime || !newTime.start || !newTime.end) {
    return next(new AppError("New date and time are required", 400));
  }

  const appointment = await Appointment.findById(req.params.id);
  if (!appointment) {
    return next(new AppError("Appointment not found", 404));
  }

  // Check for conflicts with new time
  const conflictingAppointment = await Appointment.findOne({
    doctor: appointment.doctor,
    scheduledDate: new Date(newDate),
    status: { $in: ["scheduled", "confirmed", "in-progress"] },
    _id: { $ne: appointment._id },
    $or: [
      {
        "scheduledTime.start": { $lt: newTime.end },
        "scheduledTime.end": { $gt: newTime.start },
      },
    ],
  });

  if (conflictingAppointment) {
    return next(new AppError("New time slot is not available", 409));
  }

  // Store rescheduling history
  appointment.reschedulingHistory.push({
    previousDate: appointment.scheduledDate,
    previousTime: appointment.scheduledTime,
    newDate: new Date(newDate),
    newTime,
    reason,
    rescheduledBy: req.user._id,
    rescheduledAt: new Date(),
  });

  // Update appointment
  appointment.scheduledDate = new Date(newDate);
  appointment.scheduledTime = newTime;
  appointment.status = "rescheduled";
  appointment.updatedBy = req.user._id;

  await appointment.save();

  res.status(200).json({
    status: "success",
    message: "Appointment rescheduled successfully",
    data: {
      appointment,
    },
  });
});

// Confirm appointment (doctor/secretary only)
const confirmAppointment = catchAsync(async (req, res, next) => {
  const appointment = await Appointment.findById(req.params.id).populate(
    "patient.user",
    "firstName lastName email phoneNumber"
  );

  if (!appointment) {
    return next(new AppError("Appointment not found", 404));
  }

  if (appointment.status !== "scheduled") {
    return next(
      new AppError("Only scheduled appointments can be confirmed", 400)
    );
  }

  appointment.status = "confirmed";
  appointment.updatedBy = req.user._id;
  await appointment.save();

  // Send confirmation notification
  await Notification.create({
    recipient: appointment.patient.user._id,
    sender: req.user._id,
    type: "appointment-confirmation",
    title: "Appointment Confirmed",
    message: `Your appointment on ${appointment.scheduledDate.toLocaleDateString()} has been confirmed`,
    relatedEntities: {
      appointment: appointment._id,
    },
  });

  res.status(200).json({
    status: "success",
    message: "Appointment confirmed successfully",
    data: {
      appointment,
    },
  });
});

// Complete appointment (doctor only)
const completeAppointment = catchAsync(async (req, res, next) => {
  const appointment = await Appointment.findById(req.params.id);

  if (!appointment) {
    return next(new AppError("Appointment not found", 404));
  }

  if (appointment.status !== "in-progress") {
    return next(
      new AppError("Only in-progress appointments can be completed", 400)
    );
  }

  appointment.status = "completed";
  appointment.updatedBy = req.user._id;
  await appointment.save();

  res.status(200).json({
    status: "success",
    message: "Appointment completed successfully",
    data: {
      appointment,
    },
  });
});

// Mark as no-show
const markNoShow = catchAsync(async (req, res, next) => {
  const appointment = await Appointment.findById(req.params.id);

  if (!appointment) {
    return next(new AppError("Appointment not found", 404));
  }

  appointment.status = "no-show";
  appointment.updatedBy = req.user._id;
  await appointment.save();

  res.status(200).json({
    status: "success",
    message: "Appointment marked as no-show",
    data: {
      appointment,
    },
  });
});

// Get appointment statistics
const getAppointmentStatistics = catchAsync(async (req, res, next) => {
  const { startDate, endDate } = req.query;

  let matchQuery = {};

  if (req.user.role === "doctor") {
    const doctor = await Doctor.findOne({ user: req.user._id });
    if (!doctor) {
      return next(new AppError("Doctor profile not found", 404));
    }
    matchQuery.doctor = doctor._id;
  } else if (req.user.role === "secretary") {
    const secretary = await Secretary.findOne({ user: req.user._id });
    if (secretary) {
      matchQuery.doctor = secretary.doctor;
    }
  }

  if (startDate || endDate) {
    matchQuery.scheduledDate = {};
    if (startDate) matchQuery.scheduledDate.$gte = new Date(startDate);
    if (endDate) matchQuery.scheduledDate.$lte = new Date(endDate);
  }

  const [stats, monthlyTrend] = await Promise.all([
    Appointment.aggregate([
      { $match: matchQuery },
      {
        $group: {
          _id: null,
          totalAppointments: { $sum: 1 },
          completedAppointments: {
            $sum: { $cond: [{ $eq: ["$status", "completed"] }, 1, 0] },
          },
          cancelledAppointments: {
            $sum: { $cond: [{ $eq: ["$status", "cancelled"] }, 1, 0] },
          },
          noShowAppointments: {
            $sum: { $cond: [{ $eq: ["$status", "no-show"] }, 1, 0] },
          },
          scheduledAppointments: {
            $sum: {
              $cond: [{ $in: ["$status", ["scheduled", "confirmed"]] }, 1, 0],
            },
          },
          averageDuration: { $avg: "$duration" },
          appointmentsByType: {
            $push: "$appointmentType",
          },
          appointmentsByStatus: {
            $push: "$status",
          },
        },
      },
    ]),

    // Get monthly trend for the last 12 months
    Appointment.aggregate([
      {
        $match: {
          ...matchQuery,
          scheduledDate: {
            $gte: new Date(
              new Date().getFullYear(),
              new Date().getMonth() - 11,
              1
            ),
          },
        },
      },
      {
        $group: {
          _id: {
            year: { $year: "$scheduledDate" },
            month: { $month: "$scheduledDate" },
          },
          count: { $sum: 1 },
          completed: {
            $sum: { $cond: [{ $eq: ["$status", "completed"] }, 1, 0] },
          },
        },
      },
      { $sort: { "_id.year": 1, "_id.month": 1 } },
    ]),
  ]);

  res.status(200).json({
    status: "success",
    data: {
      statistics: stats[0] || {
        totalAppointments: 0,
        completedAppointments: 0,
        cancelledAppointments: 0,
        noShowAppointments: 0,
        scheduledAppointments: 0,
        averageDuration: 0,
        appointmentsByType: [],
        appointmentsByStatus: [],
      },
      monthlyTrend,
    },
  });
});

// Bulk update status
const bulkUpdateStatus = catchAsync(async (req, res, next) => {
  const { appointmentIds, status } = req.body;

  if (!appointmentIds || appointmentIds.length === 0) {
    return next(new AppError("Appointment IDs are required", 400));
  }

  const result = await Appointment.updateMany(
    { _id: { $in: appointmentIds } },
    { status, updatedBy: req.user._id }
  );

  res.status(200).json({
    status: "success",
    message: `${result.modifiedCount} appointments updated successfully`,
    data: {
      modifiedCount: result.modifiedCount,
    },
  });
});

// Bulk cancel appointments
const bulkCancel = catchAsync(async (req, res, next) => {
  const { appointmentIds, reason } = req.body;

  if (!appointmentIds || appointmentIds.length === 0) {
    return next(new AppError("Appointment IDs are required", 400));
  }

  const result = await Appointment.updateMany(
    { _id: { $in: appointmentIds } },
    {
      status: "cancelled",
      "cancellation.cancelledAt": new Date(),
      "cancellation.cancelledBy": req.user._id,
      "cancellation.reason": reason || "Bulk cancellation",
      updatedBy: req.user._id,
    }
  );

  res.status(200).json({
    status: "success",
    message: `${result.modifiedCount} appointments cancelled successfully`,
    data: {
      modifiedCount: result.modifiedCount,
    },
  });
});

module.exports = {
  getAppointments,
  createAppointment,
  getAppointmentById,
  updateAppointment,
  cancelAppointment,
  rescheduleAppointment,
  confirmAppointment,
  completeAppointment,
  markNoShow,
  getDoctorAvailability,
  getCalendarView,
  getUpcomingAppointments,
  getAppointmentStatistics,
  bulkUpdateStatus,
  bulkCancel,
};
