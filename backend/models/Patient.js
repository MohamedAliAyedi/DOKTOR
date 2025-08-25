const mongoose = require('mongoose');

const patientSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true
  },
  patientId: {
    type: String,
    unique: true,
    required: true
  },
  dateOfBirth: {
    type: Date,
    required: [true, 'Date of birth is required']
  },
  gender: {
    type: String,
    enum: ['male', 'female', 'other'],
    required: [true, 'Gender is required']
  },
  bloodType: {
    type: String,
    enum: ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'],
    required: false
  },
  height: {
    value: Number, // in cm
    unit: {
      type: String,
      default: 'cm'
    }
  },
  weight: {
    value: Number, // in kg
    unit: {
      type: String,
      default: 'kg'
    }
  },
  fitzpatrickType: {
    type: String,
    enum: ['1', '2', '3', '4', '5', '6'],
    required: false
  },
  emergencyContact: {
    name: {
      type: String,
      required: [true, 'Emergency contact name is required']
    },
    relationship: {
      type: String,
      required: [true, 'Emergency contact relationship is required']
    },
    phoneNumber: {
      type: String,
      required: [true, 'Emergency contact phone is required']
    },
    email: String
  },
  address: {
    street: String,
    city: String,
    state: String,
    zipCode: String,
    country: String
  },
  insuranceInfo: {
    provider: String,
    policyNumber: String,
    groupNumber: String,
    expiryDate: Date,
    coverageType: String
  },
  medicalHistory: {
    allergies: [{
      allergen: String,
      severity: {
        type: String,
        enum: ['mild', 'moderate', 'severe']
      },
      reaction: String,
      diagnosedDate: Date
    }],
    chronicConditions: [{
      condition: String,
      diagnosedDate: Date,
      status: {
        type: String,
        enum: ['active', 'resolved', 'managed']
      }
    }],
    surgeries: [{
      procedure: String,
      date: Date,
      hospital: String,
      surgeon: String,
      notes: String
    }],
    familyHistory: [{
      relation: String,
      condition: String,
      ageOfOnset: Number
    }]
  },
  currentMedications: [{
    medication: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Prescription'
    },
    startDate: Date,
    endDate: Date,
    isActive: Boolean
  }],
  doctors: [{
    doctor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Doctor'
    },
    connectedAt: {
      type: Date,
      default: Date.now
    },
    status: {
      type: String,
      enum: ['active', 'inactive', 'pending'],
      default: 'pending'
    },
    isPrimary: {
      type: Boolean,
      default: false
    }
  }],
  vitalSigns: [{
    date: {
      type: Date,
      default: Date.now
    },
    bloodPressure: {
      systolic: Number,
      diastolic: Number
    },
    heartRate: Number,
    temperature: Number,
    weight: Number,
    height: Number,
    oxygenSaturation: Number,
    recordedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }
  }],
  preferences: {
    appointmentReminders: {
      email: Boolean,
      sms: Boolean,
      push: Boolean,
      timeBefore: Number // minutes before appointment
    },
    medicationReminders: {
      enabled: Boolean,
      methods: [String] // ['email', 'sms', 'push']
    }
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtual for age calculation
patientSchema.virtual('age').get(function() {
  if (!this.dateOfBirth) return null;
  const today = new Date();
  const birthDate = new Date(this.dateOfBirth);
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();
  
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }
  
  return age;
});

// Pre-save middleware to generate patient ID
patientSchema.pre('save', async function(next) {
  if (!this.patientId) {
    const count = await this.constructor.countDocuments();
    this.patientId = `P-${String(count + 1).padStart(5, '0')}`;
  }
  next();
});

// Indexes
patientSchema.index({ 'user': 1 });
patientSchema.index({ 'patientId': 1 });
patientSchema.index({ 'doctors.doctor': 1 });

module.exports = mongoose.model('Patient', patientSchema);