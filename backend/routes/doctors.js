const express = require('express');
const doctorController = require('../controllers/doctorController');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

// Public routes
router.get('/search', doctorController.searchDoctors);
router.get('/specializations', doctorController.getSpecializations);

// Protected routes
router.use(protect);

router.get('/', doctorController.getDoctors);
router.get('/profile', authorize('doctor'), doctorController.getDoctorProfile);
router.patch('/profile', authorize('doctor'), doctorController.updateDoctorProfile);
router.get('/patients', authorize('doctor'), doctorController.getDoctorPatients);
router.get('/statistics', authorize('doctor'), doctorController.getDoctorStatistics);
router.post('/services', authorize('doctor'), doctorController.addService);
router.patch('/services/:serviceId', authorize('doctor'), doctorController.updateService);
router.delete('/services/:serviceId', authorize('doctor'), doctorController.deleteService);
router.patch('/working-hours', authorize('doctor'), doctorController.updateWorkingHours);
router.post('/unavailability', authorize('doctor'), doctorController.addUnavailability);
router.delete('/unavailability/:unavailabilityId', authorize('doctor'), doctorController.removeUnavailability);

router.get('/:id', doctorController.getDoctorById);
router.post('/:id/connect', authorize('patient'), doctorController.connectToDoctor);
router.post('/:id/disconnect', authorize('patient'), doctorController.disconnectFromDoctor);
router.post('/:id/rate', authorize('patient'), doctorController.rateDoctor);

module.exports = router;