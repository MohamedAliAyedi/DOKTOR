const nodemailer = require("nodemailer");

class EmailService {
  constructor() {
    this.transporter = nodemailer.createTransport({
      host: process.env.EMAIL_HOST,
      port: process.env.EMAIL_PORT,
      secure: false,
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });
  }

  async sendEmail(options) {
    const mailOptions = {
      from: process.env.EMAIL_FROM,
      to: options.email,
      subject: options.subject,
      text: options.message,
      html: options.html,
    };

    await this.transporter.sendMail(mailOptions);
  }

  async sendWelcomeEmail(user) {
    const subject = "Welcome to DOKTOR - Your Medical Journey Starts Here";
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #003DC6;">Welcome to DOKTOR!</h1>
        <p>Dear ${user.firstName} ${user.lastName},</p>
        <p>Welcome to DOKTOR - your comprehensive medical information platform.</p>
        <p>Your account has been successfully created with the role: <strong>${user.role}</strong></p>
        <p>You can now access all the features available for your account type.</p>
        <div style="margin: 20px 0; padding: 20px; background-color: #f8f9fa; border-radius: 8px;">
          <h3>Next Steps:</h3>
          <ul>
            <li>Complete your profile information</li>
            <li>Verify your email and phone number</li>
            <li>Explore the dashboard features</li>
          </ul>
        </div>
        <p>If you have any questions, please don't hesitate to contact our support team.</p>
        <p>Best regards,<br>The DOKTOR Team</p>
      </div>
    `;

    await this.sendEmail({
      email: user.email,
      subject,
      html,
    });
  }

  async sendVerificationEmail(user, token) {
    const subject = "Verify Your Email - DOKTOR";
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #003DC6;">Email Verification</h1>
        <p>Dear ${user.firstName},</p>
        <p>Please verify your email address by entering the following code:</p>
        <div style="text-align: center; margin: 30px 0;">
          <span style="font-size: 32px; font-weight: bold; color: #003DC6; letter-spacing: 5px;">${token}</span>
        </div>
        <p>This code will expire in ${
          process.env.OTP_EXPIRE_MINUTES || 10
        } minutes.</p>
        <p>If you didn't request this verification, please ignore this email.</p>
        <p>Best regards,<br>The DOKTOR Team</p>
      </div>
    `;

    await this.sendEmail({
      email: user.email,
      subject,
      html,
    });
  }

  async sendPasswordResetEmail(user, resetToken) {
    const subject = "Password Reset - DOKTOR";
    const resetUrl = `${process.env.FRONTEND_URL}/auth/reset-password?token=${resetToken}`;

    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #003DC6;">Password Reset Request</h1>
        <p>Dear ${user.firstName},</p>
        <p>You requested a password reset for your DOKTOR account.</p>
        <p>Click the button below to reset your password:</p>
        <div style="text-align: center; margin: 30px 0;">
          <a href="${resetUrl}" style="background-color: #003DC6; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">Reset Password</a>
        </div>
        <p>Or copy and paste this link in your browser:</p>
        <p style="word-break: break-all; color: #666;">${resetUrl}</p>
        <p>This link will expire in 1 hour.</p>
        <p>If you didn't request this reset, please ignore this email.</p>
        <p>Best regards,<br>The DOKTOR Team</p>
      </div>
    `;

    await this.sendEmail({
      email: user.email,
      subject,
      html,
    });
  }

  async sendAppointmentConfirmation(appointment) {
    const subject = "Appointment Confirmation - DOKTOR";
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #003DC6;">Appointment Confirmed</h1>
        <p>Your appointment has been confirmed with the following details:</p>
        <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <p><strong>Date:</strong> ${appointment.scheduledDate.toLocaleDateString()}</p>
          <p><strong>Time:</strong> ${appointment.scheduledTime.start} - ${
      appointment.scheduledTime.end
    }</p>
          <p><strong>Type:</strong> ${appointment.appointmentType}</p>
          <p><strong>Reason:</strong> ${appointment.reason}</p>
        </div>
        <p>Please arrive 15 minutes before your scheduled time.</p>
        <p>Best regards,<br>The DOKTOR Team</p>
      </div>
    `;

    await this.sendEmail({
      email: appointment.patient.user.email,
      subject,
      html,
    });
  }

  async sendAppointmentReminder(appointment) {
    const subject = "Appointment Reminder - DOKTOR";
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #003DC6;">Appointment Reminder</h1>
        <p>This is a reminder for your upcoming appointment:</p>
        <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <p><strong>Date:</strong> ${appointment.scheduledDate.toLocaleDateString()}</p>
          <p><strong>Time:</strong> ${appointment.scheduledTime.start} - ${
      appointment.scheduledTime.end
    }</p>
          <p><strong>Doctor:</strong> Dr. ${
            appointment.doctor.user.firstName
          } ${appointment.doctor.user.lastName}</p>
        </div>
        <p>Please arrive 15 minutes before your scheduled time.</p>
        <p>Best regards,<br>The DOKTOR Team</p>
      </div>
    `;

    await this.sendEmail({
      email: appointment.patient.user.email,
      subject,
      html,
    });
  }
}

module.exports = new EmailService();
