const mongoose = require('mongoose');

const doctorSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true
  },
  licenseNumber: {
    type: String,
    required: [true, 'License number is required'],
    unique: true,
    trim: true
  },
  specialization: {
    type: String,
    required: [true, 'Specialization is required'],
    trim: true
  },
  subSpecializations: [{
    type: String,
    trim: true
  }],
  experience: {
    type: Number,
    required: [true, 'Years of experience is required'],
    min: [0, 'Experience cannot be negative']
  },
  education: [{
    institution: {
      type: String,
      required: true
    },
    degree: {
      type: String,
      required: true
    },
    year: {
      type: Number,
      required: true
    }
  }],
  certifications: [{
    name: String,
    issuedBy: String,
    issuedDate: Date,
    expiryDate: Date
  }],
  clinicInfo: {
    name: {
      type: String,
      required: [true, 'Clinic name is required']
    },
    address: {
      street: String,
      city: String,
      state: String,
      zipCode: String,
      country: String
    },
    coordinates: {
      latitude: Number,
      longitude: Number
    },
    phoneNumber: String,
    email: String
  },
  workingHours: {
    monday: { start: String, end: String, isWorking: Boolean },
    tuesday: { start: String, end: String, isWorking: Boolean },
    wednesday: { start: String, end: String, isWorking: Boolean },
    thursday: { start: String, end: String, isWorking: Boolean },
    friday: { start: String, end: String, isWorking: Boolean },
    saturday: { start: String, end: String, isWorking: Boolean },
    sunday: { start: String, end: String, isWorking: Boolean }
  },
  services: [{
    name: {
      type: String,
      required: true
    },
    description: String,
    price: {
      type: Number,
      required: true
    },
    duration: {
      type: Number, // in minutes
      required: true
    },
    isActive: {
      type: Boolean,
      default: true
    }
  }],
  consultationFee: {
    type: Number,
    required: [true, 'Consultation fee is required'],
    min: [0, 'Consultation fee cannot be negative']
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
  },
  patients: [{
    patient: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Patient'
    },
    connectedAt: {
      type: Date,
      default: Date.now
    },
    status: {
      type: String,
      enum: ['active', 'inactive'],
      default: 'active'
    }
  }],
  secretaries: [{
    secretary: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Secretary'
    },
    permissions: {
      appointments: {
        view: Boolean,
        edit: Boolean,
        manage: Boolean
      },
      patients: {
        view: Boolean,
        edit: Boolean,
        manage: Boolean
      },
      billing: {
        view: Boolean,
        edit: Boolean,
        manage: Boolean
      },
      consultations: {
        view: Boolean,
        edit: Boolean,
        manage: Boolean
      }
    },
    addedAt: {
      type: Date,
      default: Date.now
    }
  }],
  unavailability: [{
    startDate: Date,
    endDate: Date,
    startTime: String,
    endTime: String,
    reason: String,
    isRecurring: Boolean,
    recurringPattern: String
  }],
  isVerified: {
    type: Boolean,
    default: false
  },
  verificationDocuments: [{
    type: String,
    url: String,
    uploadedAt: Date
  }],
  bankDetails: {
    accountNumber: String,
    bankName: String,
    routingNumber: String,
    accountHolderName: String
  },
  statistics: {
    totalPatients: {
      type: Number,
      default: 0
    },
    totalConsultations: {
      type: Number,
      default: 0
    },
    totalRevenue: {
      type: Number,
      default: 0
    },
    averageConsultationTime: {
      type: Number,
      default: 0
    }
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes
doctorSchema.index({ 'user': 1 });
doctorSchema.index({ 'licenseNumber': 1 });
doctorSchema.index({ 'specialization': 1 });
doctorSchema.index({ 'rating.average': -1 });
doctorSchema.index({ 'clinicInfo.address.city': 1 });

module.exports = mongoose.model('Doctor', doctorSchema);