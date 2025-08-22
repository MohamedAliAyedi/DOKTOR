const express = require('express');
const { body } = require('express-validator');
const authController = require('../controllers/authController');
const { protect } = require('../middleware/auth');

const router = express.Router();

// Validation rules
const registerValidation = [
  body('firstName').trim().isLength({ min: 2, max: 50 }).withMessage('First name must be between 2 and 50 characters'),
  body('lastName').trim().isLength({ min: 2, max: 50 }).withMessage('Last name must be between 2 and 50 characters'),
  body('email').isEmail().normalizeEmail().withMessage('Please provide a valid email'),
  body('password').isLength({ min: 8 }).withMessage('Password must be at least 8 characters long')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/)
    .withMessage('Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character'),
  body('phoneNumber').isMobilePhone().withMessage('Please provide a valid phone number'),
  body('role').isIn(['patient', 'doctor', 'secretary']).withMessage('Invalid role specified')
];

const loginValidation = [
  body('email').isEmail().normalizeEmail().withMessage('Please provide a valid email'),
  body('password').notEmpty().withMessage('Password is required')
];

const forgotPasswordValidation = [
  body('email').isEmail().normalizeEmail().withMessage('Please provide a valid email')
];

const resetPasswordValidation = [
  body('token').notEmpty().withMessage('Reset token is required'),
  body('password').isLength({ min: 8 }).withMessage('Password must be at least 8 characters long')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/)
    .withMessage('Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character')
];

const verifyOTPValidation = [
  body('otp').isLength({ min: 4, max: 6 }).isNumeric().withMessage('Please provide a valid OTP'),
  body('type').isIn(['email', 'phone']).withMessage('Invalid verification type')
];

// Public routes
router.post('/register', registerValidation, authController.register);
router.post('/login', loginValidation, authController.login);
router.post('/forgot-password', forgotPasswordValidation, authController.forgotPassword);
router.post('/reset-password', resetPasswordValidation, authController.resetPassword);
router.post('/verify-otp', verifyOTPValidation, authController.verifyOTP);
router.post('/resend-otp', authController.resendOTP);
router.post('/refresh-token', authController.refreshToken);

// Protected routes
router.use(protect); // All routes after this middleware are protected

router.post('/logout', authController.logout);
router.post('/logout-all', authController.logoutAll);
router.get('/me', authController.getMe);
router.patch('/update-password', authController.updatePassword);
router.patch('/update-profile', authController.updateProfile);
router.delete('/delete-account', authController.deleteAccount);

module.exports = router;