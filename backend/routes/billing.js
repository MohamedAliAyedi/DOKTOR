const express = require('express');
const billingController = require('../controllers/billingController');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

// All routes are protected
router.use(protect);

// Routes
router.get('/', billingController.getBills);
router.post('/', authorize('doctor', 'secretary'), billingController.createBill);
router.get('/statistics', authorize('doctor', 'secretary'), billingController.getBillingStatistics);
router.get('/revenue-report', authorize('doctor', 'secretary'), billingController.getRevenueReport);

router.get('/:id', billingController.getBillById);
router.patch('/:id', authorize('doctor', 'secretary'), billingController.updateBill);
router.delete('/:id', authorize('doctor', 'secretary'), billingController.deleteBill);

// Payment operations
router.post('/:id/payment', authorize('doctor', 'secretary'), billingController.recordPayment);
router.post('/:id/refund', authorize('doctor', 'secretary'), billingController.processRefund);
router.post('/:id/send-reminder', authorize('doctor', 'secretary'), billingController.sendPaymentReminder);

// Bulk operations
router.patch('/bulk/update-status', authorize('doctor', 'secretary'), billingController.bulkUpdatePaymentStatus);

module.exports = router;