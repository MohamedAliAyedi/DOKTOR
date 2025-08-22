const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
  notificationId: {
    type: String,
    unique: true,
    required: true
  },
  recipient: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  sender: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  type: {
    type: String,
    enum: [
      'appointment-reminder',
      'appointment-confirmation',
      'appointment-cancellation',
      'appointment-rescheduled',
      'medication-reminder',
      'lab-results-ready',
      'prescription-ready',
      'payment-due',
      'payment-received',
      'new-message',
      'consultation-complete',
      'referral-received',
      'system-update',
      'emergency-alert'
    ],
    required: true
  },
  title: {
    type: String,
    required: [true, 'Notification title is required'],
    trim: true
  },
  message: {
    type: String,
    required: [true, 'Notification message is required'],
    trim: true
  },
  data: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
  },
  channels: {
    push: {
      sent: {
        type: Boolean,
        default: false
      },
      sentAt: Date,
      deliveryStatus: {
        type: String,
        enum: ['pending', 'delivered', 'failed']
      },
      deviceTokens: [String]
    },
    email: {
      sent: {
        type: Boolean,
        default: false
      },
      sentAt: Date,
      deliveryStatus: {
        type: String,
        enum: ['pending', 'delivered', 'failed', 'bounced']
      },
      emailId: String
    },
    sms: {
      sent: {
        type: Boolean,
        default: false
      },
      sentAt: Date,
      deliveryStatus: {
        type: String,
        enum: ['pending', 'delivered', 'failed']
      },
      messageId: String
    },
    inApp: {
      sent: {
        type: Boolean,
        default: true
      },
      sentAt: {
        type: Date,
        default: Date.now
      }
    }
  },
  priority: {
    type: String,
    enum: ['low', 'normal', 'high', 'urgent'],
    default: 'normal'
  },
  isRead: {
    type: Boolean,
    default: false
  },
  readAt: Date,
  actionRequired: {
    type: Boolean,
    default: false
  },
  actionUrl: String,
  actionText: String,
  expiresAt: Date,
  scheduledFor: Date, // For scheduled notifications
  retryCount: {
    type: Number,
    default: 0
  },
  maxRetries: {
    type: Number,
    default: 3
  },
  relatedEntities: {
    appointment: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Appointment'
    },
    consultation: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Consultation'
    },
    prescription: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Prescription'
    },
    bill: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Bill'
    },
    medicalRecord: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'MedicalRecord'
    }
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Pre-save middleware to generate notification ID
notificationSchema.pre('save', async function(next) {
  if (!this.notificationId) {
    const count = await mongoose.model('Notification').countDocuments();
    this.notificationId = `NOT-${String(count + 1).padStart(8, '0')}`;
  }
  next();
});

// Virtual for checking if notification is expired
notificationSchema.virtual('isExpired').get(function() {
  return this.expiresAt && this.expiresAt < new Date();
});

// Virtual for time since creation
notificationSchema.virtual('timeAgo').get(function() {
  const now = new Date();
  const diffTime = Math.abs(now - this.createdAt);
  const diffMinutes = Math.floor(diffTime / (1000 * 60));
  const diffHours = Math.floor(diffTime / (1000 * 60 * 60));
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
  
  if (diffMinutes < 60) {
    return `${diffMinutes} minutes ago`;
  } else if (diffHours < 24) {
    return `${diffHours} hours ago`;
  } else {
    return `${diffDays} days ago`;
  }
});

// Method to mark as read
notificationSchema.methods.markAsRead = function() {
  this.isRead = true;
  this.readAt = new Date();
  return this.save();
};

// Indexes
notificationSchema.index({ 'recipient': 1 });
notificationSchema.index({ 'type': 1 });
notificationSchema.index({ 'isRead': 1 });
notificationSchema.index({ 'createdAt': -1 });
notificationSchema.index({ 'scheduledFor': 1 });
notificationSchema.index({ 'recipient': 1, 'isRead': 1, 'createdAt': -1 });

module.exports = mongoose.model('Notification', notificationSchema);