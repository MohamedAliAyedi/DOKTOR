const express = require('express');
const notificationController = require('../controllers/notificationController');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

// All routes are protected
router.use(protect);

// Routes
router.get('/', notificationController.getNotifications);
router.get('/unread-count', notificationController.getUnreadCount);
router.patch('/:id/read', notificationController.markAsRead);
router.patch('/mark-all-read', notificationController.markAllAsRead);
router.delete('/:id', notificationController.deleteNotification);
router.post('/send', authorize('doctor', 'secretary', 'admin'), notificationController.sendNotification);

// Notification preferences
router.get('/preferences', notificationController.getNotificationPreferences);
router.patch('/preferences', notificationController.updateNotificationPreferences);

// Bulk operations
router.patch('/bulk/read', notificationController.bulkMarkAsRead);
router.delete('/bulk/delete', notificationController.bulkDelete);

module.exports = router;