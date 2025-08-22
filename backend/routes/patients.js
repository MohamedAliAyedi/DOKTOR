const express = require('express');
const patientController = require('../controllers/patientController');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

// All routes are protected
router.use(protect);

// Patient routes
router.get('/profile', authorize('patient'), patientController.getPatientProfile);
router.patch('/profile', authorize('patient'), patientController.updatePatientProfile);
router.get('/doctors', authorize('patient'), patientController.getPatientDoctors);
router.get('/medical-history', authorize('patient'), patientController.getMedicalHistory);
router.patch('/medical-history', authorize('patient'), patientController.updateMedicalHistory);
router.get('/medications', authorize('patient'), patientController.getCurrentMedications);
router.get('/vital-signs', authorize('patient'), patientController.getVitalSigns);
router.post('/vital-signs', authorize('patient', 'doctor', 'secretary'), patientController.addVitalSigns);

// Doctor/Secretary accessible routes
router.get('/', authorize('doctor', 'secretary'), patientController.getPatients);
router.get('/:id', authorize('doctor', 'secretary'), patientController.getPatientById);
router.patch('/:id', authorize('doctor', 'secretary'), patientController.updatePatient);

// Connection management
router.post('/:id/connect', authorize('doctor'), patientController.acceptPatientConnection);
router.post('/:id/disconnect', authorize('doctor'), patientController.disconnectPatient);

module.exports = router;