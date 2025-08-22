const mongoose = require('mongoose');

const billSchema = new mongoose.Schema({
  billId: {
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
  appointment: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Appointment'
  },
  consultation: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Consultation'
  },
  billType: {
    type: String,
    enum: ['consultation', 'procedure', 'lab-test', 'imaging', 'prescription', 'other'],
    required: true
  },
  items: [{
    description: {
      type: String,
      required: true
    },
    serviceCode: String, // CPT or custom code
    quantity: {
      type: Number,
      required: true,
      min: 1
    },
    unitPrice: {
      type: Number,
      required: true,
      min: 0
    },
    totalPrice: {
      type: Number,
      required: true,
      min: 0
    },
    discount: {
      type: Number,
      default: 0,
      min: 0
    },
    tax: {
      rate: Number,
      amount: Number
    }
  }],
  subtotal: {
    type: Number,
    required: true,
    min: 0
  },
  totalDiscount: {
    type: Number,
    default: 0,
    min: 0
  },
  totalTax: {
    type: Number,
    default: 0,
    min: 0
  },
  totalAmount: {
    type: Number,
    required: true,
    min: 0
  },
  currency: {
    type: String,
    default: 'TND'
  },
  paymentStatus: {
    type: String,
    enum: ['pending', 'partial', 'paid', 'overdue', 'cancelled', 'refunded'],
    default: 'pending'
  },
  paymentMethod: {
    type: String,
    enum: ['cash', 'card', 'bank-transfer', 'insurance', 'check', 'mobile-payment'],
    required: function() {
      return this.paymentStatus === 'paid' || this.paymentStatus === 'partial';
    }
  },
  paymentDetails: {
    transactionId: String,
    paymentDate: Date,
    paidAmount: Number,
    remainingAmount: Number,
    paymentReference: String,
    paymentProcessor: String
  },
  insurance: {
    provider: String,
    policyNumber: String,
    claimNumber: String,
    coveragePercentage: Number,
    approvedAmount: Number,
    deductible: Number,
    copay: Number,
    claimStatus: {
      type: String,
      enum: ['pending', 'approved', 'denied', 'under-review']
    },
    claimSubmittedDate: Date,
    claimApprovedDate: Date
  },
  dueDate: {
    type: Date,
    required: true
  },
  issueDate: {
    type: Date,
    default: Date.now
  },
  notes: String,
  attachments: [{
    filename: String,
    originalName: String,
    url: String,
    uploadedAt: Date,
    uploadedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }
  }],
  reminders: [{
    sentDate: Date,
    method: {
      type: String,
      enum: ['email', 'sms', 'phone']
    },
    status: {
      type: String,
      enum: ['sent', 'delivered', 'failed']
    }
  }],
  refunds: [{
    amount: Number,
    reason: String,
    refundDate: Date,
    refundMethod: String,
    processedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }
  }],
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  updatedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Pre-save middleware to generate bill ID and calculate totals
billSchema.pre('save', async function(next) {
  if (!this.billId) {
    const count = await mongoose.model('Bill').countDocuments();
    this.billId = `BILL-${String(count + 1).padStart(6, '0')}`;
  }
  
  // Calculate totals
  this.subtotal = this.items.reduce((sum, item) => sum + item.totalPrice, 0);
  this.totalDiscount = this.items.reduce((sum, item) => sum + (item.discount || 0), 0);
  this.totalTax = this.items.reduce((sum, item) => sum + (item.tax?.amount || 0), 0);
  this.totalAmount = this.subtotal - this.totalDiscount + this.totalTax;
  
  // Calculate remaining amount for partial payments
  if (this.paymentDetails.paidAmount) {
    this.paymentDetails.remainingAmount = this.totalAmount - this.paymentDetails.paidAmount;
  }
  
  next();
});

// Virtual for overdue status
billSchema.virtual('isOverdue').get(function() {
  return this.dueDate < new Date() && this.paymentStatus !== 'paid';
});

// Virtual for days overdue
billSchema.virtual('daysOverdue').get(function() {
  if (!this.isOverdue) return 0;
  const diffTime = new Date() - this.dueDate;
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
});

// Indexes
billSchema.index({ 'patient': 1 });
billSchema.index({ 'doctor': 1 });
billSchema.index({ 'paymentStatus': 1 });
billSchema.index({ 'dueDate': 1 });
billSchema.index({ 'issueDate': -1 });

module.exports = mongoose.model('Bill', billSchema);