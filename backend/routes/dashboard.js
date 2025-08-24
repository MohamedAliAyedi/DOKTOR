const express = require('express');
const dashboardController = require('../controllers/dashboardController');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

// All routes are protected
router.use(protect);

// Doctor dashboard statistics
router.get('/doctor/stats', authorize('doctor'), dashboardController.getDoctorDashboardStats);

// Patient dashboard statistics  
router.get('/patient/stats', authorize('patient'), dashboardController.getPatientDashboardStats);

module.exports = router;