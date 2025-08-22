const express = require('express');
const secretaryController = require('../controllers/secretaryController');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

// All routes are protected
router.use(protect);

// Secretary management (doctor only)
router.get('/', authorize('doctor'), secretaryController.getSecretaries);
router.post('/', authorize('doctor'), secretaryController.addSecretary);
router.get('/profile', authorize('secretary'), secretaryController.getSecretaryProfile);
router.patch('/profile', authorize('secretary'), secretaryController.updateSecretaryProfile);

router.get('/:id', authorize('doctor'), secretaryController.getSecretaryById);
router.patch('/:id', authorize('doctor'), secretaryController.updateSecretary);
router.delete('/:id', authorize('doctor'), secretaryController.removeSecretary);
router.patch('/:id/permissions', authorize('doctor'), secretaryController.updatePermissions);
router.patch('/:id/activate', authorize('doctor'), secretaryController.activateSecretary);
router.patch('/:id/deactivate', authorize('doctor'), secretaryController.deactivateSecretary);

// Performance tracking
router.get('/:id/performance', authorize('doctor'), secretaryController.getSecretaryPerformance);
router.post('/:id/performance/rate', authorize('doctor'), secretaryController.rateSecretary);

module.exports = router;