const express = require('express');
const prescriptionController = require('../controllers/prescriptionController');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

// All routes are protected
router.use(protect);

// Routes
router.get('/', prescriptionController.getPrescriptions);
router.post('/', authorize('doctor'), prescriptionController.createPrescription);
router.get('/:id', prescriptionController.getPrescriptionById);
router.patch('/:id', authorize('doctor'), prescriptionController.updatePrescription);
router.delete('/:id', authorize('doctor'), prescriptionController.deletePrescription);

// Medication management
router.post('/:id/medications', authorize('doctor'), prescriptionController.addMedication);
router.patch('/:id/medications/:medicationId', authorize('doctor'), prescriptionController.updateMedication);
router.delete('/:id/medications/:medicationId', authorize('doctor'), prescriptionController.removeMedication);

// Prescription actions
router.post('/:id/discontinue', authorize('doctor'), prescriptionController.discontinuePrescription);
router.post('/:id/refill', authorize('doctor'), prescriptionController.refillPrescription);
router.get('/:id/pdf', prescriptionController.generatePrescriptionPDF);

// Adherence tracking
router.post('/:id/adherence', authorize('patient'), prescriptionController.recordAdherence);
router.get('/:id/adherence-report', authorize('doctor', 'patient'), prescriptionController.getAdherenceReport);

module.exports = router;