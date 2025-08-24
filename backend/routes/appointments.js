const express = require("express");
const { body } = require("express-validator");
const appointmentController = require("../controllers/appointmentController");
const { protect, authorize } = require("../middleware/auth");

const router = express.Router();

// All routes are protected
router.use(protect);

// Validation rules
const createAppointmentValidation = [
  body("doctorId").isMongoId().withMessage("Valid doctor ID is required"),
  body("appointmentType")
    .isIn([
      "consultation",
      "follow-up",
      "routine-checkup",
      "urgent-care",
      "virtual",
      "examination",
    ])
    .withMessage("Invalid appointment type"),
  body("scheduledDate")
    .isISO8601()
    .withMessage("Valid scheduled date is required"),
  body("scheduledTime.start")
    .matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/)
    .withMessage("Valid start time is required (HH:MM format)"),
  body("scheduledTime.end")
    .matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/)
    .withMessage("Valid end time is required (HH:MM format)"),
  body("reason")
    .trim()
    .isLength({ min: 5, max: 500 })
    .withMessage("Reason must be between 5 and 500 characters"),
];

const updateAppointmentValidation = [
  body("status")
    .optional()
    .isIn([
      "scheduled",
      "confirmed",
      "in-progress",
      "completed",
      "cancelled",
      "no-show",
      "rescheduled",
    ])
    .withMessage("Invalid status"),
  body("scheduledDate")
    .optional()
    .isISO8601()
    .withMessage("Valid scheduled date is required"),
  body("scheduledTime.start")
    .optional()
    .matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/)
    .withMessage("Valid start time is required"),
  body("scheduledTime.end")
    .optional()
    .matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/)
    .withMessage("Valid end time is required"),
];

// Routes
router.get("/", appointmentController.getAppointments);
router.post(
  "/",
  createAppointmentValidation,
  appointmentController.createAppointment
);
router.get(
  "/availability/:doctorId",
  appointmentController.getDoctorAvailability
);
router.get("/calendar", appointmentController.getCalendarView);
router.get("/upcoming", appointmentController.getUpcomingAppointments);
router.get(
  "/statistics",
  authorize("doctor", "secretary"),
  appointmentController.getAppointmentStatistics
);

router.get("/:id", appointmentController.getAppointmentById);
router.patch(
  "/:id",
  updateAppointmentValidation,
  appointmentController.updateAppointment
);
router.delete("/:id", appointmentController.cancelAppointment);
router.post("/:id/reschedule", appointmentController.rescheduleAppointment);
router.post(
  "/:id/confirm",
  authorize("doctor", "secretary"),
  appointmentController.confirmAppointment
);
router.post(
  "/:id/complete",
  authorize("doctor"),
  appointmentController.completeAppointment
);
router.post(
  "/:id/no-show",
  authorize("doctor", "secretary"),
  appointmentController.markNoShow
);

// Bulk operations
router.patch(
  "/bulk/update-status",
  authorize("doctor", "secretary"),
  appointmentController.bulkUpdateStatus
);
router.delete(
  "/bulk/cancel",
  authorize("doctor", "secretary"),
  appointmentController.bulkCancel
);

module.exports = router;
