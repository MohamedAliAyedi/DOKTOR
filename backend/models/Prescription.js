const mongoose = require('mongoose');

const prescriptionSchema = new mongoose.Schema({
  prescriptionId: {
    type: String,
    unique: true,
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
  consultation: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Consultation'
  },
  medications: [{
    name: {
      type: String,
      required: [true, 'Medication name is required'],
      trim: true
    },
    genericName: String,
    dosage: {
      amount: {
        type: Number,
        required: [true, 'Dosage amount is required']
      },
      unit: {
        type: String,
        required: [true, 'Dosage unit is required'],
        enum: ['mg', 'g', 'ml', 'l', 'mcg', 'units', 'drops', 'puffs']
      }
    },
    frequency: {
      type: String,
      required: [true, 'Frequency is required'],
      enum: ['once-daily', 'twice-daily', 'three-times-daily', 'four-times-daily', 'as-needed', 'every-4-hours', 'every-6-hours', 'every-8-hours', 'every-12-hours']
    },
    timing: {
      beforeBreakfast: {
        type: Boolean,
        default: false
      },
      afterBreakfast: {
        type: Boolean,
        default: false
      },
      beforeLunch: {
        type: Boolean,
        default: false
      },
      afterLunch: {
        type: Boolean,
        default: false
      },
      beforeDinner: {
        type: Boolean,
        default: false
      },
      afterDinner: {
        type: Boolean,
        default: false
      },
      beforeBed: {
        type: Boolean,
        default: false
      },
      withFood: {
        type: Boolean,
        default: false
      },
      onEmptyStomach: {
        type: Boolean,
        default: false
      }
    },
    duration: {
      startDate: {
        type: Date,
        required: [true, 'Start date is required']
      },
      endDate: {
        type: Date,
        required: [true, 'End date is required']
      },
      totalDays: Number
    },
    quantity: {
      prescribed: Number,
      dispensed: Number,
      remaining: Number
    },
    instructions: {
      type: String,
      trim: true
    },
    warnings: [String],
    sideEffects: [String],
    interactions: [String],
    isActive: {
      type: Boolean,
      default: true
    },
    discontinuedDate: Date,
    discontinuedReason: String
  }],
  status: {
    type: String,
    enum: ['active', 'completed', 'discontinued', 'expired'],
    default: 'active'
  },
  pharmacy: {
    name: String,
    address: String,
    phoneNumber: String,
    email: String
  },
  refills: {
    allowed: {
      type: Number,
      default: 0
    },
    remaining: {
      type: Number,
      default: 0
    },
    lastRefillDate: Date
  },
  adherence: {
    tracking: {
      type: Boolean,
      default: false
    },
    missedDoses: [{
      medicationName: String,
      missedDate: Date,
      reason: String
    }],
    adherenceRate: {
      type: Number,
      min: 0,
      max: 100
    }
  },
  interactions: {
    drugDrug: [{
      medication1: String,
      medication2: String,
      severity: {
        type: String,
        enum: ['minor', 'moderate', 'major']
      },
      description: String
    }],
    drugAllergy: [{
      medication: String,
      allergen: String,
      reaction: String
    }]
  },
  electronicSignature: {
    doctorSignature: {
      signed: Boolean,
      signedAt: Date,
      ipAddress: String
    },
    pharmacistSignature: {
      signed: Boolean,
      signedAt: Date,
      pharmacistId: String
    }
  },
  isElectronic: {
    type: Boolean,
    default: true
  },
  printedCopies: [{
    printedAt: Date,
    printedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }
  }]
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Pre-save middleware to generate prescription ID and calculate duration
prescriptionSchema.pre('save', async function(next) {
  if (!this.prescriptionId) {
    const count = await mongoose.model('Prescription').countDocuments();
    this.prescriptionId = `RX-${String(count + 1).padStart(6, '0')}`;
  }
  
  // Calculate total days for each medication
  this.medications.forEach(medication => {
    if (medication.duration.startDate && medication.duration.endDate) {
      const diffTime = medication.duration.endDate - medication.duration.startDate;
      medication.duration.totalDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    }
  });
  
  next();
});

// Virtual for checking if prescription is expired
prescriptionSchema.virtual('isExpired').get(function() {
  const now = new Date();
  return this.medications.some(med => 
    med.duration.endDate && med.duration.endDate < now
  );
});

// Indexes
prescriptionSchema.index({ 'patient': 1 });
prescriptionSchema.index({ 'doctor': 1 });
prescriptionSchema.index({ 'consultation': 1 });
prescriptionSchema.index({ 'status': 1 });
prescriptionSchema.index({ 'medications.duration.endDate': 1 });

module.exports = mongoose.model('Prescription', prescriptionSchema);