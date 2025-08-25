const Doctor = require('../models/Doctor');
const Patient = require('../models/Patient');
const Appointment = require('../models/Appointment');
const Consultation = require('../models/Consultation');
const Bill = require('../models/Bill');
const { AppError } = require('../utils/appError');
const { catchAsync } = require('../utils/catchAsync');

// Get doctor dashboard statistics
const getDoctorDashboardStats = catchAsync(async (req, res, next) => {
  const doctor = await Doctor.findOne({ user: req.user._id });
  if (!doctor) {
    return next(new AppError('Doctor profile not found', 404));
  }

  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const startOfWeek = new Date(now.getFullYear(), now.getMonth(), now.getDate() - now.getDay());
  const startOfDay = new Date();
  startOfDay.setHours(0, 0, 0, 0);
  const endOfDay = new Date();
  endOfDay.setHours(23, 59, 59, 999);

  // Parallel queries for better performance
  const [
    totalPatients,
    monthlyRevenue,
    pendingRevenue,
    todayAppointments,
    weeklyAppointments,
    monthlyAppointments,
    completedConsultations,
    paidBills,
    pendingBills,
    totalBills,
    recentAppointments,
    revenueTrend,
    patientStats
  ] = await Promise.all([
    doctor.patients ? doctor.patients.filter(p => p.status === 'active').length : 0,
    
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
    
    Bill.aggregate([
      { 
        $match: { 
          doctor: doctor._id, 
          paymentStatus: { $in: ['pending', 'overdue'] }
        }
      },
      { $group: { _id: null, total: { $sum: '$totalAmount' } } }
    ]),
    
    Appointment.countDocuments({ 
      doctor: doctor._id, 
      scheduledDate: { $gte: startOfDay, $lte: endOfDay },
      status: { $in: ['scheduled', 'confirmed', 'in-progress'] }
    }),
    
    Appointment.countDocuments({ 
      doctor: doctor._id, 
      scheduledDate: { $gte: startOfWeek },
      status: { $in: ['scheduled', 'confirmed', 'completed'] }
    }),
    
    Appointment.countDocuments({ 
      doctor: doctor._id, 
      scheduledDate: { $gte: startOfMonth },
      status: { $in: ['scheduled', 'confirmed', 'completed'] }
    }),
    
    Consultation.countDocuments({ 
      doctor: doctor._id, 
      status: 'completed' 
    }),
    
    Bill.countDocuments({ 
      doctor: doctor._id, 
      paymentStatus: 'paid' 
    }),
    
    Bill.countDocuments({ 
      doctor: doctor._id, 
      paymentStatus: { $in: ['pending', 'overdue'] }
    }),
    
    Bill.countDocuments({ 
      doctor: doctor._id 
    }),

    // Get recent appointments for schedule
    Appointment.find({
      doctor: doctor._id,
      scheduledDate: { $gte: startOfDay },
      status: { $in: ['scheduled', 'confirmed'] }
    })
    .populate('patient', 'user patientId')
    .populate('patient.user', 'firstName lastName avatar')
    .sort({ scheduledDate: 1, 'scheduledTime.start': 1 })
    .limit(5),

    // Get revenue trend data for chart
    Bill.aggregate([
      {
        $match: {
          doctor: doctor._id,
          paymentStatus: 'paid',
          'paymentDetails.paymentDate': { 
            $gte: new Date(now.getFullYear(), now.getMonth() - 6, 1) 
          }
        }
      },
      {
        $group: {
          _id: {
            year: { $year: '$paymentDetails.paymentDate' },
            month: { $month: '$paymentDetails.paymentDate' }
          },
          revenue: { $sum: '$totalAmount' },
          count: { $sum: 1 }
        }
      },
      { $sort: { '_id.year': 1, '_id.month': 1 } }
    ]),

    // Get patient statistics for chart
    Appointment.aggregate([
      {
        $match: {
          doctor: doctor._id,
          scheduledDate: { $gte: new Date(now.getFullYear(), now.getMonth() - 11, 1) }
        }
      },
      {
        $group: {
          _id: {
            year: { $year: '$scheduledDate' },
            month: { $month: '$scheduledDate' }
          },
          newPatients: { 
            $sum: { 
              $cond: [
                { $eq: ['$appointmentType', 'consultation'] }, 
                1, 
                0
              ] 
            }
          },
          followUps: { 
            $sum: { 
              $cond: [
                { $eq: ['$appointmentType', 'follow-up'] }, 
                1, 
                0
              ] 
            }
          }
        }
      },
      { $sort: { '_id.year': 1, '_id.month': 1 } }
    ])
  ]);

  res.status(200).json({
    status: 'success',
    data: {
      statistics: {
        totalPatients,
        monthlyRevenue: monthlyRevenue[0]?.total || 0,
        pendingRevenue: pendingRevenue[0]?.total || 0,
        todayAppointments,
        weeklyAppointments,
        monthlyAppointments,
        completedConsultations,
        paidBills,
        pendingBills,
        totalBills
      },
      recentAppointments: recentAppointments || [],
      revenueTrend: revenueTrend || [],
      patientStats: patientStats || []
    }
  });
});

// Get patient dashboard statistics
const getPatientDashboardStats = catchAsync(async (req, res, next) => {
  const patient = await Patient.findOne({ user: req.user._id });
  if (!patient) {
    return next(new AppError('Patient profile not found', 404));
  }

  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

  const [
    upcomingAppointments,
    completedAppointments,
    activePrescriptions,
    connectedDoctors,
    unreadNotifications,
    recentMedicalRecords,
    vitalSigns
  ] = await Promise.all([
    Appointment.find({
      patient: patient._id,
      scheduledDate: { $gte: now },
      status: { $in: ['scheduled', 'confirmed'] }
    })
    .populate('doctor', 'user specialization')
    .populate('doctor.user', 'firstName lastName avatar')
    .sort({ scheduledDate: 1 })
    .limit(5),

    Appointment.countDocuments({
      patient: patient._id,
      status: 'completed',
      scheduledDate: { $gte: startOfMonth }
    }),

    Prescription.countDocuments({
      patient: patient._id,
      status: 'active'
    }),

    Patient.findById(patient._id)
      .populate('doctors.doctor', 'user specialization')
      .populate('doctors.doctor.user', 'firstName lastName avatar')
      .select('doctors'),

    Notification.countDocuments({
      recipient: req.user._id,
      isRead: false
    }),

    MedicalRecord.find({
      patient: patient._id
    })
    .populate('doctor', 'user specialization')
    .populate('doctor.user', 'firstName lastName')
    .sort({ createdAt: -1 })
    .limit(5),

    patient.vitalSigns.slice(-5) // Get last 5 vital signs
  ]);

  res.status(200).json({
    status: 'success',
    data: {
      statistics: {
        upcomingAppointments: upcomingAppointments.length,
        completedAppointments,
        activePrescriptions,
        connectedDoctors: connectedDoctors?.doctors?.filter(d => d.status === 'active').length || 0,
        unreadNotifications,
        recentMedicalRecords: recentMedicalRecords.length
      },
      upcomingAppointments,
      connectedDoctors: connectedDoctors?.doctors?.filter(d => d.status === 'active') || [],
      recentMedicalRecords,
      vitalSigns
    }
  });
});

module.exports = {
  getDoctorDashboardStats,
  getPatientDashboardStats
};