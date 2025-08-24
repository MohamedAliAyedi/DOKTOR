const Bill = require('../models/Bill');
const Doctor = require('../models/Doctor');
const Patient = require('../models/Patient');
const Appointment = require('../models/Appointment');
const Notification = require('../models/Notification');
const { AppError } = require('../utils/appError');
const { catchAsync } = require('../utils/catchAsync');
const emailService = require('../utils/email');
const smsService = require('../utils/sms');

// Get bills
const getBills = catchAsync(async (req, res, next) => {
  const {
    page = 1,
    limit = 20,
    paymentStatus,
    billType,
    patientId,
    search,
    startDate,
    endDate
  } = req.query;

  let query = {};

  // Filter based on user role
  if (req.user.role === 'patient') {
    const patient = await Patient.findOne({ user: req.user._id });
    if (!patient) {
      return next(new AppError('Patient profile not found', 404));
    }
    query.patient = patient._id;
  } else if (req.user.role === 'doctor') {
    const doctor = await Doctor.findOne({ user: req.user._id });
    if (!doctor) {
      return next(new AppError('Doctor profile not found', 404));
    }
    query.doctor = doctor._id;
  } else if (req.user.role === 'secretary') {
    const secretary = await Secretary.findOne({ user: req.user._id });
    if (secretary) {
      query.doctor = secretary.doctor;
    }
  }

  // Apply filters
  if (paymentStatus) query.paymentStatus = paymentStatus;
  if (billType) query.billType = billType;
  if (patientId) query.patient = patientId;

  // Date range filter
  if (startDate || endDate) {
    query.issueDate = {};
    if (startDate) query.issueDate.$gte = new Date(startDate);
    if (endDate) query.issueDate.$lte = new Date(endDate);
  }

  // Search functionality
  let populateQuery = {};
  if (search) {
    // We'll filter after population since we need to search in populated fields
    populateQuery = {
      $or: [
        { billId: { $regex: search, $options: 'i' } },
        { notes: { $regex: search, $options: 'i' } }
      ]
    };
  }

  const bills = await Bill.find(query)
    .populate('patient', 'user patientId')
    .populate('doctor', 'user specialization')
    .populate('patient.user doctor.user', 'firstName lastName avatar')
    .populate('appointment', 'appointmentId scheduledDate')
    .sort({ issueDate: -1 })
    .limit(limit * 1)
    .skip((page - 1) * limit);

  // Apply search filter after population
  let filteredBills = bills;
  if (search) {
    filteredBills = bills.filter(bill => 
      bill.billId.toLowerCase().includes(search.toLowerCase()) ||
      bill.patient?.user?.firstName?.toLowerCase().includes(search.toLowerCase()) ||
      bill.patient?.user?.lastName?.toLowerCase().includes(search.toLowerCase()) ||
      bill.notes?.toLowerCase().includes(search.toLowerCase())
    );
  }

  const total = await Bill.countDocuments(query);

  res.status(200).json({
    status: 'success',
    results: filteredBills.length,
    pagination: {
      page: parseInt(page),
      limit: parseInt(limit),
      total,
      pages: Math.ceil(total / limit)
    },
    data: {
      bills: filteredBills
    }
  });
});

// Create bill
const createBill = catchAsync(async (req, res, next) => {
  const {
    patientId,
    appointmentId,
    consultationId,
    billType,
    items,
    dueDate,
    notes
  } = req.body;

  if (!patientId || !items || items.length === 0) {
    return next(new AppError('Patient ID and items are required', 400));
  }

  const doctor = await Doctor.findOne({ user: req.user._id });
  if (!doctor) {
    return next(new AppError('Doctor profile not found', 404));
  }

  // Calculate totals
  let subtotal = 0;
  let totalTax = 0;
  let totalDiscount = 0;

  items.forEach(item => {
    item.totalPrice = item.quantity * item.unitPrice;
    subtotal += item.totalPrice;
    
    if (item.discount) {
      totalDiscount += item.discount;
    }
    
    if (item.tax) {
      item.tax.amount = (item.totalPrice * item.tax.rate) / 100;
      totalTax += item.tax.amount;
    }
  });

  const bill = await Bill.create({
    patient: patientId,
    doctor: doctor._id,
    appointment: appointmentId,
    consultation: consultationId,
    billType,
    items,
    subtotal,
    totalDiscount,
    totalTax,
    dueDate: dueDate ? new Date(dueDate) : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days default
    notes,
    createdBy: req.user._id
  });

  await bill.populate('patient doctor');
  await bill.populate('patient.user doctor.user', 'firstName lastName email phoneNumber');

  // Create notification for patient
  await Notification.create({
    recipient: bill.patient.user._id,
    sender: req.user._id,
    type: 'payment-due',
    title: 'New Bill Generated',
    message: `A new bill of ${bill.totalAmount} ${bill.currency} has been generated`,
    relatedEntities: {
      bill: bill._id
    }
  });

  res.status(201).json({
    status: 'success',
    message: 'Bill created successfully',
    data: {
      bill
    }
  });
});

// Get bill by ID
const getBillById = catchAsync(async (req, res, next) => {
  const bill = await Bill.findById(req.params.id)
    .populate('patient', 'user patientId')
    .populate('doctor', 'user specialization')
    .populate('patient.user doctor.user', 'firstName lastName avatar email phoneNumber')
    .populate('appointment', 'appointmentId scheduledDate')
    .populate('consultation', 'consultationId');

  if (!bill) {
    return next(new AppError('Bill not found', 404));
  }

  // Check access permissions
  const hasAccess = 
    bill.patient.user._id.toString() === req.user._id.toString() ||
    bill.doctor.user._id.toString() === req.user._id.toString() ||
    req.user.role === 'admin';

  if (!hasAccess) {
    return next(new AppError('Access denied to this bill', 403));
  }

  res.status(200).json({
    status: 'success',
    data: {
      bill
    }
  });
});

// Update bill
const updateBill = catchAsync(async (req, res, next) => {
  const bill = await Bill.findByIdAndUpdate(
    req.params.id,
    { ...req.body, updatedBy: req.user._id },
    { new: true, runValidators: true }
  ).populate('patient doctor');

  if (!bill) {
    return next(new AppError('Bill not found', 404));
  }

  res.status(200).json({
    status: 'success',
    message: 'Bill updated successfully',
    data: {
      bill
    }
  });
});

// Delete bill
const deleteBill = catchAsync(async (req, res, next) => {
  const bill = await Bill.findByIdAndDelete(req.params.id);

  if (!bill) {
    return next(new AppError('Bill not found', 404));
  }

  res.status(200).json({
    status: 'success',
    message: 'Bill deleted successfully'
  });
});

// Record payment
const recordPayment = catchAsync(async (req, res, next) => {
  const {
    paymentMethod,
    paidAmount,
    transactionId,
    paymentReference
  } = req.body;

  const bill = await Bill.findById(req.params.id);
  if (!bill) {
    return next(new AppError('Bill not found', 404));
  }

  const remainingAmount = bill.totalAmount - (bill.paymentDetails.paidAmount || 0);

  if (paidAmount > remainingAmount) {
    return next(new AppError('Payment amount exceeds remaining balance', 400));
  }

  // Update payment details
  bill.paymentMethod = paymentMethod;
  bill.paymentDetails = {
    ...bill.paymentDetails,
    paymentDate: new Date(),
    paidAmount: (bill.paymentDetails.paidAmount || 0) + paidAmount,
    remainingAmount: remainingAmount - paidAmount,
    transactionId,
    paymentReference
  };

  // Update payment status
  if (bill.paymentDetails.remainingAmount <= 0) {
    bill.paymentStatus = 'paid';
  } else {
    bill.paymentStatus = 'partial';
  }

  await bill.save();

  // Create notification
  await Notification.create({
    recipient: bill.patient,
    sender: req.user._id,
    type: 'payment-received',
    title: 'Payment Received',
    message: `Payment of ${paidAmount} ${bill.currency} has been received`,
    relatedEntities: {
      bill: bill._id
    }
  });

  res.status(200).json({
    status: 'success',
    message: 'Payment recorded successfully',
    data: {
      bill
    }
  });
});

// Process refund
const processRefund = catchAsync(async (req, res, next) => {
  const { amount, reason, refundMethod } = req.body;

  const bill = await Bill.findById(req.params.id);
  if (!bill) {
    return next(new AppError('Bill not found', 404));
  }

  if (amount > bill.paymentDetails.paidAmount) {
    return next(new AppError('Refund amount exceeds paid amount', 400));
  }

  bill.refunds.push({
    amount,
    reason,
    refundDate: new Date(),
    refundMethod,
    processedBy: req.user._id
  });

  // Update payment status
  const totalRefunded = bill.refunds.reduce((sum, refund) => sum + refund.amount, 0);
  if (totalRefunded >= bill.paymentDetails.paidAmount) {
    bill.paymentStatus = 'refunded';
  }

  await bill.save();

  res.status(200).json({
    status: 'success',
    message: 'Refund processed successfully',
    data: {
      bill
    }
  });
});

// Send payment reminder
const sendPaymentReminder = catchAsync(async (req, res, next) => {
  const bill = await Bill.findById(req.params.id)
    .populate('patient.user', 'firstName lastName email phoneNumber');

  if (!bill) {
    return next(new AppError('Bill not found', 404));
  }

  if (bill.paymentStatus === 'paid') {
    return next(new AppError('Bill is already paid', 400));
  }

  // Send email reminder
  try {
    await emailService.sendEmail({
      email: bill.patient.user.email,
      subject: 'Payment Reminder - DOKTOR',
      message: `This is a reminder that your bill ${bill.billId} of ${bill.totalAmount} ${bill.currency} is due on ${bill.dueDate.toLocaleDateString()}.`
    });

    // Send SMS reminder
    await smsService.sendBillingReminder(bill.patient.user.phoneNumber, bill);

    // Record reminder
    bill.reminders.push({
      sentDate: new Date(),
      method: 'email',
      status: 'sent'
    });

    await bill.save();

    res.status(200).json({
      status: 'success',
      message: 'Payment reminder sent successfully'
    });
  } catch (error) {
    return next(new AppError('Failed to send payment reminder', 500));
  }
});

// Get billing statistics
const getBillingStatistics = catchAsync(async (req, res, next) => {
  const { startDate, endDate } = req.query;

  let matchQuery = {};
  
  if (req.user.role === 'doctor') {
    const doctor = await Doctor.findOne({ user: req.user._id });
    matchQuery.doctor = doctor._id;
  }

  if (startDate || endDate) {
    matchQuery.issueDate = {};
    if (startDate) matchQuery.issueDate.$gte = new Date(startDate);
    if (endDate) matchQuery.issueDate.$lte = new Date(endDate);
  }

  const stats = await Bill.aggregate([
    { $match: matchQuery },
    {
      $group: {
        _id: null,
        totalBills: { $sum: 1 },
        totalRevenue: { $sum: '$totalAmount' },
        paidBills: {
          $sum: { $cond: [{ $eq: ['$paymentStatus', 'paid'] }, 1, 0] }
        },
        pendingBills: {
          $sum: { $cond: [{ $eq: ['$paymentStatus', 'pending'] }, 1, 0] }
        },
        overdueBills: {
          $sum: { $cond: [{ $eq: ['$paymentStatus', 'overdue'] }, 1, 0] }
        },
        paidRevenue: {
          $sum: { $cond: [{ $eq: ['$paymentStatus', 'paid'] }, '$totalAmount', 0] }
        },
        pendingRevenue: {
          $sum: { $cond: [{ $eq: ['$paymentStatus', 'pending'] }, '$totalAmount', 0] }
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

// Get revenue report
const getRevenueReport = catchAsync(async (req, res, next) => {
  const { period = 'monthly', year = new Date().getFullYear() } = req.query;

  let matchQuery = {};
  
  if (req.user.role === 'doctor') {
    const doctor = await Doctor.findOne({ user: req.user._id });
    matchQuery.doctor = doctor._id;
  }

  matchQuery.paymentStatus = 'paid';
  matchQuery['paymentDetails.paymentDate'] = {
    $gte: new Date(year, 0, 1),
    $lt: new Date(parseInt(year) + 1, 0, 1)
  };

  let groupBy;
  if (period === 'monthly') {
    groupBy = { $month: '$paymentDetails.paymentDate' };
  } else if (period === 'weekly') {
    groupBy = { $week: '$paymentDetails.paymentDate' };
  } else {
    groupBy = { $dayOfYear: '$paymentDetails.paymentDate' };
  }

  const revenueData = await Bill.aggregate([
    { $match: matchQuery },
    {
      $group: {
        _id: groupBy,
        revenue: { $sum: '$totalAmount' },
        billCount: { $sum: 1 },
        averageBillAmount: { $avg: '$totalAmount' }
      }
    },
    { $sort: { _id: 1 } }
  ]);

  res.status(200).json({
    status: 'success',
    data: {
      period,
      year,
      revenueData
    }
  });
});

// Bulk update payment status
const bulkUpdatePaymentStatus = catchAsync(async (req, res, next) => {
  const { billIds, paymentStatus } = req.body;

  if (!billIds || billIds.length === 0) {
    return next(new AppError('Bill IDs are required', 400));
  }

  const result = await Bill.updateMany(
    { _id: { $in: billIds } },
    { paymentStatus, updatedBy: req.user._id }
  );

  res.status(200).json({
    status: 'success',
    message: `${result.modifiedCount} bills updated successfully`,
    data: {
      modifiedCount: result.modifiedCount
    }
  });
});

module.exports = {
  getBills,
  createBill,
  getBillById,
  updateBill,
  deleteBill,
  recordPayment,
  processRefund,
  sendPaymentReminder,
  getBillingStatistics,
  getRevenueReport,
  bulkUpdatePaymentStatus
};