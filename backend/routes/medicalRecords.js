const express = require('express');
const medicalRecordController = require('../controllers/medicalRecordController');
const { protect, authorize } = require('../middleware/auth');
const upload = require('../middleware/upload');

const router = express.Router();

// All routes are protected
router.use(protect);

// Routes
router.get('/', medicalRecordController.getMedicalRecords);
router.post('/', authorize('doctor'), medicalRecordController.createMedicalRecord);
router.get('/types', medicalRecordController.getRecordTypes);

// Specific record type routes
router.get('/xray', medicalRecordController.getXRayRecords);
router.get('/blood-tests', medicalRecordController.getBloodTestRecords);

router.get('/:id', medicalRecordController.getMedicalRecordById);
router.patch('/:id', authorize('doctor'), medicalRecordController.updateMedicalRecord);
router.delete('/:id', authorize('doctor'), medicalRecordController.deleteMedicalRecord);

// File operations
router.post('/:id/attachments', upload.array('files', 5), medicalRecordController.addAttachments);
router.delete('/:id/attachments/:attachmentId', authorize('doctor'), medicalRecordController.removeAttachment);

// Sharing and access
router.post('/:id/share', authorize('doctor'), medicalRecordController.shareRecord);
router.delete('/:id/share/:userId', authorize('doctor'), medicalRecordController.revokeAccess);
router.get('/:id/access-log', authorize('doctor'), medicalRecordController.getAccessLog);

// Lab results
router.post('/lab-results', authorize('doctor'), medicalRecordController.addLabResults);
router.get('/lab-results/:patientId', medicalRecordController.getLabResults);

// Imaging results
router.post('/imaging-results', authorize('doctor'), medicalRecordController.addImagingResults);
router.get('/imaging-results/:patientId', medicalRecordController.getImagingResults);

module.exports = router;