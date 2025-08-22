const crypto = require('crypto');

class OTPGenerator {
  // Generate numeric OTP
  static generateNumericOTP(length = 4) {
    const digits = '0123456789';
    let otp = '';
    
    for (let i = 0; i < length; i++) {
      otp += digits[Math.floor(Math.random() * digits.length)];
    }
    
    return otp;
  }

  // Generate alphanumeric OTP
  static generateAlphanumericOTP(length = 6) {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let otp = '';
    
    for (let i = 0; i < length; i++) {
      otp += chars[Math.floor(Math.random() * chars.length)];
    }
    
    return otp;
  }

  // Generate secure random token
  static generateSecureToken(length = 32) {
    return crypto.randomBytes(length).toString('hex');
  }

  // Generate password reset token
  static generatePasswordResetToken() {
    const resetToken = crypto.randomBytes(32).toString('hex');
    const hashedToken = crypto
      .createHash('sha256')
      .update(resetToken)
      .digest('hex');
    
    return { resetToken, hashedToken };
  }

  // Verify OTP expiry
  static isOTPExpired(createdAt, expiryMinutes = 10) {
    const now = new Date();
    const expiryTime = new Date(createdAt.getTime() + (expiryMinutes * 60 * 1000));
    return now > expiryTime;
  }

  // Generate session ID
  static generateSessionId() {
    return crypto.randomBytes(16).toString('hex');
  }

  // Generate API key
  static generateApiKey() {
    const timestamp = Date.now().toString();
    const randomBytes = crypto.randomBytes(16).toString('hex');
    return `dk_${timestamp}_${randomBytes}`;
  }
}

module.exports = OTPGenerator;