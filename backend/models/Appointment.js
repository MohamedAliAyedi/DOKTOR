const mongoose = require("mongoose");

const appointmentSchema = new mongoose.Schema(
  {
    appointmentId: {
      type: String,
      unique: true,
      required: true,
    },
    patient: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Patient",
      required: true,
    },
    doctor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Doctor",
      required: true,
    },
    appointmentType: {
      type: String,
      enum: [
        "consultation",
        "follow-up",
        "routine-checkup",
        "urgent-care",
        "virtual",
        "examination",
      ],
      required: [true, "Appointment type is required"],
    },
    scheduledDate: {
      type: Date,
      required: [true, "Scheduled date is required"],
    },
    scheduledTime: {
      start: {
        type: String,
        required: [true, "Start time is required"],
      },
      end: {
        type: String,
        required: [true, "End time is required"],
      },
    },
    duration: {
      type: Number, // in minutes
      required: [true, "Duration is required"],
      min: [15, "Minimum appointment duration is 15 minutes"],
    },
    status: {
      type: String,
      enum: [
        "scheduled",
        "confirmed",
        "in-progress",
        "completed",
        "cancelled",
        "no-show",
        "rescheduled",
      ],
      default: "scheduled",
    },
    priority: {
      type: String,
      enum: ["low", "normal", "high", "urgent"],
      default: "normal",
    },
    reason: {
      type: String,
      required: [true, "Reason for appointment is required"],
      trim: true,
    },
    symptoms: [
      {
        type: String,
        trim: true,
      },
    ],
    notes: {
      patient: String, // Notes from patient
      doctor: String, // Notes from doctor
      secretary: String, // Notes from secretary
    },
    consultation: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Consultation",
    },
    billing: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Bill",
    },
    reminders: [
      {
        type: {
          type: String,
          enum: ["email", "sms", "push"],
        },
        sentAt: Date,
        scheduledFor: Date,
        status: {
          type: String,
          enum: ["pending", "sent", "failed"],
        },
      },
    ],
    reschedulingHistory: [
      {
        previousDate: Date,
        previousTime: {
          start: String,
          end: String,
        },
        newDate: Date,
        newTime: {
          start: String,
          end: String,
        },
        reason: String,
        rescheduledBy: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
        },
        rescheduledAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],
    cancellation: {
      cancelledAt: Date,
      cancelledBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
      reason: String,
      refundAmount: Number,
      refundStatus: {
        type: String,
        enum: ["pending", "processed", "failed", "not-applicable"],
      },
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    updatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Virtual for appointment date and time combined
appointmentSchema.virtual("appointmentDateTime").get(function () {
  if (!this.scheduledDate || !this.scheduledTime.start) return null;

  const date = new Date(this.scheduledDate);
  const [hours, minutes] = this.scheduledTime.start.split(":");
  date.setHours(parseInt(hours), parseInt(minutes), 0, 0);

  return date;
});

// Virtual for checking if appointment is upcoming
appointmentSchema.virtual("isUpcoming").get(function () {
  const appointmentDateTime = this.appointmentDateTime;
  if (!appointmentDateTime) return false;

  return appointmentDateTime > new Date() && this.status === "scheduled";
});

// Pre-save middleware to generate appointment ID
appointmentSchema.pre("save", async function (next) {
  if (!this.appointmentId) {
    try {
      const count = await this.constructor.countDocuments();
      this.appointmentId = `APT-${String(count + 1).padStart(6, '0')}`;
    } catch (error) {
      console.error('Error generating appointment ID:', error);
      this.appointmentId = `APT-${Date.now()}`;
    }
  }
  next();
});

// Indexes for performance
appointmentSchema.index({ patient: 1 });
appointmentSchema.index({ doctor: 1 });
appointmentSchema.index({ scheduledDate: 1 });
appointmentSchema.index({ status: 1 });
appointmentSchema.index({ appointmentType: 1 });
appointmentSchema.index({ scheduledDate: 1, doctor: 1 });

module.exports = mongoose.model("Appointment", appointmentSchema);
