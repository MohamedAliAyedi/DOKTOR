const mongoose = require('mongoose');

const secretarySchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true
  },
  employeeId: {
    type: String,
    unique: true,
    required: true
  },
  doctor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Doctor',
    required: true
  },
  jobTitle: {
    type: String,
    required: [true, 'Job title is required'],
    trim: true
  },
  department: {
    type: String,
    trim: true
  },
  hireDate: {
    type: Date,
    required: [true, 'Hire date is required'],
    default: Date.now
  },
  salary: {
    amount: {
      type: Number,
      required: [true, 'Salary amount is required'],
      min: [0, 'Salary cannot be negative']
    },
    currency: {
      type: String,
      default: 'TND'
    },
    paymentFrequency: {
      type: String,
      enum: ['weekly', 'biweekly', 'monthly'],
      default: 'monthly'
    }
  },
  permissions: {
    appointments: {
      view: {
        type: Boolean,
        default: true
      },
      edit: {
        type: Boolean,
        default: true
      },
      manage: {
        type: Boolean,
        default: false
      }
    },
    patients: {
      view: {
        type: Boolean,
        default: true
      },
      edit: {
        type: Boolean,
        default: false
      },
      manage: {
        type: Boolean,
        default: false
      }
    },
    billing: {
      view: {
        type: Boolean,
        default: true
      },
      edit: {
        type: Boolean,
        default: true
      },
      manage: {
        type: Boolean,
        default: false
      }
    },
    consultations: {
      view: {
        type: Boolean,
        default: true
      },
      edit: {
        type: Boolean,
        default: false
      },
      manage: {
        type: Boolean,
        default: false
      }
    },
    medicalRecords: {
      view: {
        type: Boolean,
        default: true
      },
      edit: {
        type: Boolean,
        default: false
      },
      manage: {
        type: Boolean,
        default: false
      }
    }
  },
  workSchedule: {
    monday: { start: String, end: String, isWorking: Boolean },
    tuesday: { start: String, end: String, isWorking: Boolean },
    wednesday: { start: String, end: String, isWorking: Boolean },
    thursday: { start: String, end: String, isWorking: Boolean },
    friday: { start: String, end: String, isWorking: Boolean },
    saturday: { start: String, end: String, isWorking: Boolean },
    sunday: { start: String, end: String, isWorking: Boolean }
  },
  performance: {
    appointmentsScheduled: {
      type: Number,
      default: 0
    },
    appointmentsCancelled: {
      type: Number,
      default: 0
    },
    patientsManaged: {
      type: Number,
      default: 0
    },
    averageResponseTime: {
      type: Number,
      default: 0 // in minutes
    },
    rating: {
      average: {
        type: Number,
        default: 0,
        min: 0,
        max: 5
      },
      count: {
        type: Number,
        default: 0
      }
    }
  },
  isActive: {
    type: Boolean,
    default: true
  },
  terminationDate: Date,
  terminationReason: String,
  notes: String
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Pre-save middleware to generate employee ID
secretarySchema.pre('save', async function(next) {
  if (!this.employeeId) {
    const count = await this.constructor.countDocuments();
    this.employeeId = `S-${String(count + 1).padStart(5, '0')}`;
  }
  next();
});

// Virtual for employment duration
secretarySchema.virtual('employmentDuration').get(function() {
  const endDate = this.terminationDate || new Date();
  const startDate = this.hireDate;
  const diffTime = Math.abs(endDate - startDate);
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays;
});

// Indexes
secretarySchema.index({ 'user': 1 });
secretarySchema.index({ 'doctor': 1 });
secretarySchema.index({ 'employeeId': 1 });
secretarySchema.index({ 'isActive': 1 });

module.exports = mongoose.model('Secretary', secretarySchema);