const twilio = require('twilio');

class SMSService {
  constructor() {
    this.client = twilio(
      process.env.TWILIO_ACCOUNT_SID,
      process.env.TWILIO_AUTH_TOKEN
    );
    this.fromNumber = process.env.TWILIO_PHONE_NUMBER;
  }

  async sendSMS(to, message) {
    try {
      const result = await this.client.messages.create({
        body: message,
        from: this.fromNumber,
        to: to
      });
      return result;
    } catch (error) {
      console.error('SMS sending failed:', error);
      throw error;
    }
  }

  async sendVerificationSMS(phoneNumber, token) {
    const message = `Your DOKTOR verification code is: ${token}. This code will expire in ${process.env.OTP_EXPIRE_MINUTES || 10} minutes.`;
    return await this.sendSMS(phoneNumber, message);
  }

  async sendAppointmentReminder(phoneNumber, appointment) {
    const message = `DOKTOR Reminder: You have an appointment on ${appointment.scheduledDate.toLocaleDateString()} at ${appointment.scheduledTime.start}. Please arrive 15 minutes early.`;
    return await this.sendSMS(phoneNumber, message);
  }

  async sendMedicationReminder(phoneNumber, medication) {
    const message = `DOKTOR Reminder: Time to take your medication - ${medication.name} (${medication.dosage.amount}${medication.dosage.unit}). Follow your prescribed schedule.`;
    return await this.sendSMS(phoneNumber, message);
  }

  async sendEmergencyAlert(phoneNumber, patientName, message) {
    const alertMessage = `DOKTOR EMERGENCY: ${patientName} - ${message}. Please respond immediately.`;
    return await this.sendSMS(phoneNumber, alertMessage);
  }

  async sendBillingReminder(phoneNumber, bill) {
    const message = `DOKTOR: Payment reminder for bill ${bill.billId}. Amount due: ${bill.totalAmount} ${bill.currency}. Due date: ${bill.dueDate.toLocaleDateString()}.`;
    return await this.sendSMS(phoneNumber, message);
  }
}

module.exports = new SMSService();