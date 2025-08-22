const Notification = require('../models/Notification');
const User = require('../models/User');
const { AppError } = require('../utils/appError');
const { catchAsync } = require('../utils/catchAsync');
const { sendNotificationToUser } = require('../socket/socketHandlers');

// Get user notifications
const getNotifications = catchAsync(async (req, res, next) => {
  const {
    page = 1,
    limit = 20,
    type,
    isRead,
    priority,
    startDate,
    endDate
  } = req.query;

  let query = { recipient: req.user._id };

  // Apply filters
  if (type) query.type = type;
  if (isRead !== undefined) query.isRead = isRead === 'true';
  if (priority) query.priority = priority;

  // Date range filter
  if (startDate || endDate) {
    query.createdAt = {};
    if (startDate) query.createdAt.$gte = new Date(startDate);
    if (endDate) query.createdAt.$lte = new Date(endDate);
  }

  const notifications = await Notification.find(query)
    .populate('sender', 'firstName lastName avatar role')
    .sort({ createdAt: -1 })
    .limit(limit * 1)
    .skip((page - 1) * limit);

  const total = await Notification.countDocuments(query);
  const unreadCount = await Notification.countDocuments({
    recipient: req.user._id,
    isRead: false
  });

  res.status(200).json({
    status: 'success',
    results: notifications.length,
    unreadCount,
    pagination: {
      page: parseInt(page),
      limit: parseInt(limit),
      total,
      pages: Math.ceil(total / limit)
    },
    data: {
      notifications
    }
  });
});

// Get unread notification count
const getUnreadCount = catchAsync(async (req, res, next) => {
  const unreadCount = await Notification.countDocuments({
    recipient: req.user._id,
    isRead: false
  });

  res.status(200).json({
    status: 'success',
    data: {
      unreadCount
    }
  });
});

// Mark notification as read
const markAsRead = catchAsync(async (req, res, next) => {
  const notification = await Notification.findById(req.params.id);

  if (!notification) {
    return next(new AppError('Notification not found', 404));
  }

  if (notification.recipient.toString() !== req.user._id.toString()) {
    return next(new AppError('Access denied to this notification', 403));
  }

  await notification.markAsRead();

  res.status(200).json({
    status: 'success',
    message: 'Notification marked as read',
    data: {
      notification
    }
  });
});

// Mark all notifications as read
const markAllAsRead = catchAsync(async (req, res, next) => {
  const result = await Notification.updateMany(
    { recipient: req.user._id, isRead: false },
    { isRead: true, readAt: new Date() }
  );

  res.status(200).json({
    status: 'success',
    message: `${result.modifiedCount} notifications marked as read`,
    data: {
      modifiedCount: result.modifiedCount
    }
  });
});

// Delete notification
const deleteNotification = catchAsync(async (req, res, next) => {
  const notification = await Notification.findById(req.params.id);

  if (!notification) {
    return next(new AppError('Notification not found', 404));
  }

  if (notification.recipient.toString() !== req.user._id.toString()) {
    return next(new AppError('Access denied to this notification', 403));
  }

  await Notification.findByIdAndDelete(req.params.id);

  res.status(200).json({
    status: 'success',
    message: 'Notification deleted successfully'
  });
});

// Send notification (admin/doctor/secretary)
const sendNotification = catchAsync(async (req, res, next) => {
  const {
    recipientId,
    recipientIds,
    type,
    title,
    message,
    data = {},
    priority = 'normal',
    channels = ['inApp'],
    scheduledFor
  } = req.body;

  if (!recipientId && (!recipientIds || recipientIds.length === 0)) {
    return next(new AppError('Recipient ID(s) required', 400));
  }

  const recipients = recipientId ? [recipientId] : recipientIds;
  const notifications = [];

  for (const recipient of recipients) {
    const user = await User.findById(recipient);
    if (!user) {
      continue; // Skip invalid recipients
    }

    const notification = await Notification.create({
      recipient,
      sender: req.user._id,
      type,
      title,
      message,
      data,
      priority,
      scheduledFor: scheduledFor ? new Date(scheduledFor) : undefined
    });

    notifications.push(notification);

    // Send real-time notification if user is online
    if (req.io) {
      sendNotificationToUser(req.io, recipient, notification);
    }

    // Send via other channels based on user preferences
    if (channels.includes('email') && user.preferences.notifications.email) {
      // Send email notification
      try {
        await emailService.sendEmail({
          email: user.email,
          subject: title,
          message: message
        });
      } catch (error) {
        console.error('Failed to send email notification:', error);
      }
    }

    if (channels.includes('sms') && user.preferences.notifications.sms) {
      // Send SMS notification
      try {
        await smsService.sendSMS(user.phoneNumber, `${title}: ${message}`);
      } catch (error) {
        console.error('Failed to send SMS notification:', error);
      }
    }
  }

  res.status(201).json({
    status: 'success',
    message: `${notifications.length} notifications sent successfully`,
    data: {
      notifications
    }
  });
});

// Get notification preferences
const getNotificationPreferences = catchAsync(async (req, res, next) => {
  const user = await User.findById(req.user._id).select('preferences.notifications');

  res.status(200).json({
    status: 'success',
    data: {
      preferences: user.preferences.notifications
    }
  });
});

// Update notification preferences
const updateNotificationPreferences = catchAsync(async (req, res, next) => {
  const { email, sms, push } = req.body;

  const updateData = {};
  if (email !== undefined) updateData['preferences.notifications.email'] = email;
  if (sms !== undefined) updateData['preferences.notifications.sms'] = sms;
  if (push !== undefined) updateData['preferences.notifications.push'] = push;

  const user = await User.findByIdAndUpdate(
    req.user._id,
    updateData,
    { new: true, runValidators: true }
  ).select('preferences.notifications');

  res.status(200).json({
    status: 'success',
    message: 'Notification preferences updated successfully',
    data: {
      preferences: user.preferences.notifications
    }
  });
});

// Bulk mark as read
const bulkMarkAsRead = catchAsync(async (req, res, next) => {
  const { notificationIds } = req.body;

  if (!notificationIds || notificationIds.length === 0) {
    return next(new AppError('Notification IDs are required', 400));
  }

  const result = await Notification.updateMany(
    {
      _id: { $in: notificationIds },
      recipient: req.user._id,
      isRead: false
    },
    {
      isRead: true,
      readAt: new Date()
    }
  );

  res.status(200).json({
    status: 'success',
    message: `${result.modifiedCount} notifications marked as read`,
    data: {
      modifiedCount: result.modifiedCount
    }
  });
});

// Bulk delete notifications
const bulkDelete = catchAsync(async (req, res, next) => {
  const { notificationIds } = req.body;

  if (!notificationIds || notificationIds.length === 0) {
    return next(new AppError('Notification IDs are required', 400));
  }

  const result = await Notification.deleteMany({
    _id: { $in: notificationIds },
    recipient: req.user._id
  });

  res.status(200).json({
    status: 'success',
    message: `${result.deletedCount} notifications deleted successfully`,
    data: {
      deletedCount: result.deletedCount
    }
  });
});

module.exports = {
  getNotifications,
  getUnreadCount,
  markAsRead,
  markAllAsRead,
  deleteNotification,
  sendNotification,
  getNotificationPreferences,
  updateNotificationPreferences,
  bulkMarkAsRead,
  bulkDelete
};