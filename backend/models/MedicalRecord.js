const mongoose = require('mongoose');

const medicalRecordSchema = new mongoose.Schema({
  recordId: {
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
  recordType: {
    type: String,
    enum: ['lab-result', 'imaging', 'prescription', 'consultation-note', 'vital-signs', 'procedure', 'discharge-summary'],
    required: true
  },
  title: {
    type: String,
    required: [true, 'Record title is required'],
    trim: true
  },
  description: {
    type: String,
    trim: true
  },
  // Lab Results
  labResults: {
    testName: String,
    testType: {
      type: String,
      enum: ['blood', 'urine', 'stool', 'saliva', 'tissue', 'other']
    },
    results: [{
      parameter: String,
      value: String,
      unit: String,
      referenceRange: String,
      status: {
        type: String,
        enum: ['normal', 'high', 'low', 'critical']
      },
      notes: String
    }],
    interpretation: String,
    recommendations: String,
    laboratoryInfo: {
      name: String,
      address: String,
      phoneNumber: String,
      certificationNumber: String
    },
    technician: String,
    reviewedBy: String
  },
  // Imaging Results
  imagingResults: {
    imagingType: {
      type: String,
      enum: ['x-ray', 'ct-scan', 'mri', 'ultrasound', 'mammogram', 'pet-scan']
    },
    bodyPart: String,
    findings: String,
    impression: String,
    recommendations: String,
    images: [{
      filename: String,
      url: String,
      description: String,
      view: String, // e.g., 'AP', 'lateral', 'oblique'
      uploadedAt: Date
    }],
    radiologist: {
      name: String,
      licenseNumber: String,
      signature: String
    },
    facility: {
      name: String,
      address: String,
      phoneNumber: String
    }
  },
  // Procedure Records
  procedureRecord: {
    procedureName: String,
    procedureCode: String, // CPT code
    indication: String,
    technique: String,
    findings: String,
    complications: String,
    postProcedureInstructions: String,
    followUpRequired: Boolean,
    followUpDate: Date
  },
  attachments: [{
    filename: String,
    originalName: String,
    mimetype: String,
    size: Number,
    url: String,
    description: String,
    uploadedAt: {
      type: Date,
      default: Date.now
    },
    uploadedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }
  }],
  tags: [String],
  isConfidential: {
    type: Boolean,
    default: false
  },
  accessLog: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    action: {
      type: String,
      enum: ['view', 'edit', 'download', 'share']
    },
    timestamp: {
      type: Date,
      default: Date.now
    },
    ipAddress: String
  }],
  sharedWith: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    permissions: {
      view: Boolean,
      download: Boolean
    },
    sharedAt: {
      type: Date,
      default: Date.now
    },
    sharedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }
  }],
  status: {
    type: String,
    enum: ['draft', 'final', 'amended', 'cancelled'],
    default: 'draft'
  },
  version: {
    type: Number,
    default: 1
  },
  previousVersions: [{
    version: Number,
    data: mongoose.Schema.Types.Mixed,
    modifiedAt: Date,
    modifiedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    reason: String
  }]
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Pre-save middleware to generate record ID
medicalRecordSchema.pre('save', async function(next) {
  if (!this.recordId) {
    const count = await mongoose.model('MedicalRecord').countDocuments();
    this.recordId = `MR-${String(count + 1).padStart(6, '0')}`;
  }
  next();
});

// Virtual for record age
medicalRecordSchema.virtual('recordAge').get(function() {
  const now = new Date();
  const created = this.createdAt;
  const diffTime = Math.abs(now - created);
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays;
});

// Indexes
medicalRecordSchema.index({ 'patient': 1 });
medicalRecordSchema.index({ 'doctor': 1 });
medicalRecordSchema.index({ 'recordType': 1 });
medicalRecordSchema.index({ 'createdAt': -1 });
medicalRecordSchema.index({ 'patient': 1, 'recordType': 1 });

module.exports = mongoose.model('MedicalRecord', medicalRecordSchema);