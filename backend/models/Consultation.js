const mongoose = require('mongoose');

const consultationSchema = new mongoose.Schema({
  consultationId: {
    type: String,
    unique: true,
    required: true
  },
  appointment: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Appointment',
    required: true
  },
  patient: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Patient',
    required: true
  },
  doctor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Doctor',
    required: true
  },
  startTime: {
    type: Date,
    required: true
  },
  endTime: Date,
  duration: Number, // in minutes
  type: {
    type: String,
    enum: ['in-person', 'virtual', 'phone', 'emergency'],
    required: true
  },
  chiefComplaint: {
    type: String,
    required: [true, 'Chief complaint is required'],
    trim: true
  },
  presentIllness: {
    type: String,
    trim: true
  },
  symptoms: [{
    name: {
      type: String,
      required: true
    },
    severity: {
      type: String,
      enum: ['mild', 'moderate', 'severe']
    },
    duration: String,
    onset: String,
    notes: String
  }],
  vitalSigns: {
    bloodPressure: {
      systolic: Number,
      diastolic: Number
    },
    heartRate: Number,
    temperature: Number,
    weight: Number,
    height: Number,
    oxygenSaturation: Number,
    respiratoryRate: Number
  },
  physicalExamination: {
    general: String,
    head: String,
    neck: String,
    chest: String,
    abdomen: String,
    extremities: String,
    neurological: String,
    skin: String,
    other: String
  },
  diagnosis: {
    primary: {
      code: String, // ICD-10 code
      description: {
        type: String,
        required: [true, 'Primary diagnosis is required']
      }
    },
    secondary: [{
      code: String,
      description: String
    }],
    differential: [{
      description: String,
      probability: String
    }]
  },
  treatmentPlan: {
    immediate: String,
    longTerm: String,
    lifestyle: String,
    followUp: String
  },
  prescriptions: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Prescription'
  }],
  labOrders: [{
    testName: String,
    urgency: {
      type: String,
      enum: ['routine', 'urgent', 'stat']
    },
    instructions: String,
    orderedAt: {
      type: Date,
      default: Date.now
    }
  }],
  imagingOrders: [{
    type: {
      type: String,
      enum: ['x-ray', 'ct-scan', 'mri', 'ultrasound', 'mammogram']
    },
    bodyPart: String,
    urgency: {
      type: String,
      enum: ['routine', 'urgent', 'stat']
    },
    instructions: String,
    orderedAt: {
      type: Date,
      default: Date.now
    }
  }],
  referrals: [{
    specialist: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Doctor'
    },
    specialization: String,
    reason: String,
    urgency: {
      type: String,
      enum: ['routine', 'urgent', 'stat']
    },
    notes: String,
    referredAt: {
      type: Date,
      default: Date.now
    }
  }],
  followUpInstructions: {
    nextAppointment: {
      recommended: Boolean,
      timeframe: String,
      reason: String
    },
    warningSignsToWatch: [String],
    whenToSeekCare: String,
    activityRestrictions: String
  },
  attachments: [{
    filename: String,
    originalName: String,
    mimetype: String,
    size: Number,
    url: String,
    uploadedAt: {
      type: Date,
      default: Date.now
    },
    uploadedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }
  }],
  status: {
    type: String,
    enum: ['in-progress', 'completed', 'cancelled'],
    default: 'in-progress'
  },
  billing: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Bill'
  },
  qualityMetrics: {
    patientSatisfaction: {
      rating: Number,
      feedback: String,
      submittedAt: Date
    },
    timeSpent: Number, // in minutes
    thoroughness: Number // 1-10 scale
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Pre-save middleware to generate consultation ID
consultationSchema.pre('save', async function(next) {
  if (!this.consultationId) {
    const count = await this.constructor.countDocuments();
    this.consultationId = `CON-${String(count + 1).padStart(6, '0')}`;
  }
  
  // Calculate duration if endTime is set
  if (this.endTime && this.startTime) {
    this.duration = Math.round((this.endTime - this.startTime) / (1000 * 60));
  }
  
  next();
});

// Indexes
consultationSchema.index({ 'patient': 1 });
consultationSchema.index({ 'doctor': 1 });
consultationSchema.index({ 'appointment': 1 });
consultationSchema.index({ 'startTime': 1 });
consultationSchema.index({ 'status': 1 });

module.exports = mongoose.model('Consultation', consultationSchema);