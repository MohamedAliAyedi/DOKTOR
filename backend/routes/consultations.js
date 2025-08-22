const express = require('express');
const consultationController = require('../controllers/consultationController');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

// All routes are protected
router.use(protect);

// Routes
router.get('/', consultationController.getConsultations);
router.post('/', authorize('doctor'), consultationController.createConsultation);
router.get('/statistics', authorize('doctor'), consultationController.getConsultationStatistics);

router.get('/:id', consultationController.getConsultationById);
router.patch('/:id', authorize('doctor'), consultationController.updateConsultation);
router.delete('/:id', authorize('doctor'), consultationController.deleteConsultation);

// Consultation actions
router.post('/:id/start', authorize('doctor'), consultationController.startConsultation);
router.post('/:id/complete', authorize('doctor'), consultationController.completeConsultation);
router.post('/:id/add-diagnosis', authorize('doctor'), consultationController.addDiagnosis);
router.post('/:id/add-prescription', authorize('doctor'), consultationController.addPrescription);
router.post('/:id/order-lab', authorize('doctor'), consultationController.orderLabTest);
router.post('/:id/order-imaging', authorize('doctor'), consultationController.orderImaging);
router.post('/:id/refer', authorize('doctor'), consultationController.referToSpecialist);

// Generate reports
router.get('/:id/report', consultationController.generateConsultationReport);

module.exports = router;