const express = require('express');
const userController = require('../controllers/userController');
const { protect, authorize } = require('../middleware/auth');
const upload = require('../middleware/upload');

const router = express.Router();

// All routes are protected
router.use(protect);

// User profile routes
router.get('/profile', userController.getProfile);
router.patch('/profile', userController.updateProfile);
router.post('/avatar', upload.single('avatar'), userController.uploadAvatar);
router.delete('/avatar', userController.deleteAvatar);

// User search and listing (admin/doctor/secretary)
router.get('/', authorize('admin', 'doctor', 'secretary'), userController.getUsers);
router.get('/search', userController.searchUsers);

// Admin only routes
router.use(authorize('admin'));
router.get('/:id', userController.getUserById);
router.patch('/:id', userController.updateUser);
router.delete('/:id', userController.deleteUser);
router.patch('/:id/activate', userController.activateUser);
router.patch('/:id/deactivate', userController.deactivateUser);

module.exports = router;