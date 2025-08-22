# DOKTOR Backend API

A comprehensive Node.js backend for the DOKTOR medical application with JWT authentication, real-time chat, and role-based access control.

## Features

### 🔐 Authentication & Authorization
- JWT-based authentication with refresh tokens
- Role-based access control (Patient, Doctor, Secretary, Admin)
- Email and SMS verification
- Password reset functionality
- Account lockout protection
- Session management

### 👥 User Management
- Multi-role user system
- Profile management for each role
- Avatar upload
- User search and filtering

### 🏥 Medical Features
- **Appointments**: Scheduling, rescheduling, cancellation with conflict detection
- **Consultations**: Complete consultation management with diagnosis and treatment plans
- **Prescriptions**: Electronic prescriptions with medication tracking
- **Medical Records**: Lab results, imaging, procedures with version control
- **Billing**: Invoice generation, payment tracking, insurance handling

### 💬 Real-time Communication
- Socket.io integration for real-time chat
- File sharing in chats
- Message read receipts
- Typing indicators
- Online/offline status
- Emergency alerts

### 🔔 Notifications
- Multi-channel notifications (Email, SMS, Push, In-app)
- Appointment reminders
- Medication reminders
- Payment reminders
- Real-time notifications

### 📊 Analytics & Reporting
- Doctor statistics and performance metrics
- Revenue reports and billing analytics
- Appointment statistics
- Patient management metrics

## Tech Stack

- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: JWT with bcryptjs
- **Real-time**: Socket.io
- **File Upload**: Multer
- **Email**: Nodemailer
- **SMS**: Twilio
- **Security**: Helmet, CORS, Rate limiting, XSS protection
- **Validation**: Express-validator

## Installation

1. Clone the repository
2. Install dependencies:
```bash
npm install
```

3. Create environment file:
```bash
cp .env.example .env
```

4. Configure your environment variables in `.env`

5. Start MongoDB service

6. Seed the database (optional):
```bash
npm run seed
```

7. Start the server:
```bash
# Development
npm run dev

# Production
npm start
```

## API Endpoints

### Authentication
- `POST /api/v1/auth/register` - Register new user
- `POST /api/v1/auth/login` - Login user
- `POST /api/v1/auth/logout` - Logout user
- `POST /api/v1/auth/refresh-token` - Refresh JWT token
- `POST /api/v1/auth/forgot-password` - Request password reset
- `POST /api/v1/auth/reset-password` - Reset password
- `POST /api/v1/auth/verify-otp` - Verify email/phone OTP
- `GET /api/v1/auth/me` - Get current user

### Users
- `GET /api/v1/users/profile` - Get user profile
- `PATCH /api/v1/users/profile` - Update user profile
- `POST /api/v1/users/avatar` - Upload avatar
- `GET /api/v1/users/search` - Search users

### Doctors
- `GET /api/v1/doctors/search` - Search doctors
- `GET /api/v1/doctors/profile` - Get doctor profile
- `PATCH /api/v1/doctors/profile` - Update doctor profile
- `GET /api/v1/doctors/patients` - Get doctor's patients
- `POST /api/v1/doctors/services` - Add service
- `PATCH /api/v1/doctors/working-hours` - Update working hours

### Patients
- `GET /api/v1/patients/profile` - Get patient profile
- `PATCH /api/v1/patients/profile` - Update patient profile
- `GET /api/v1/patients/doctors` - Get patient's doctors
- `GET /api/v1/patients/medications` - Get current medications
- `POST /api/v1/patients/vital-signs` - Add vital signs

### Appointments
- `GET /api/v1/appointments` - Get appointments
- `POST /api/v1/appointments` - Create appointment
- `GET /api/v1/appointments/calendar` - Get calendar view
- `GET /api/v1/appointments/availability/:doctorId` - Get doctor availability
- `PATCH /api/v1/appointments/:id` - Update appointment
- `DELETE /api/v1/appointments/:id` - Cancel appointment

### Consultations
- `GET /api/v1/consultations` - Get consultations
- `POST /api/v1/consultations` - Create consultation
- `POST /api/v1/consultations/:id/start` - Start consultation
- `POST /api/v1/consultations/:id/complete` - Complete consultation
- `POST /api/v1/consultations/:id/add-diagnosis` - Add diagnosis

### Prescriptions
- `GET /api/v1/prescriptions` - Get prescriptions
- `POST /api/v1/prescriptions` - Create prescription
- `POST /api/v1/prescriptions/:id/refill` - Refill prescription
- `GET /api/v1/prescriptions/:id/pdf` - Generate PDF

### Medical Records
- `GET /api/v1/medical-records` - Get medical records
- `POST /api/v1/medical-records` - Create medical record
- `POST /api/v1/medical-records/:id/attachments` - Add attachments
- `POST /api/v1/medical-records/:id/share` - Share record

### Billing
- `GET /api/v1/billing` - Get bills
- `POST /api/v1/billing` - Create bill
- `POST /api/v1/billing/:id/payment` - Record payment
- `GET /api/v1/billing/statistics` - Get billing statistics

### Chat
- `GET /api/v1/chat` - Get user chats
- `POST /api/v1/chat` - Create chat
- `GET /api/v1/chat/:chatId/messages` - Get chat messages
- `POST /api/v1/chat/:chatId/messages` - Send message

### Notifications
- `GET /api/v1/notifications` - Get notifications
- `PATCH /api/v1/notifications/:id/read` - Mark as read
- `POST /api/v1/notifications/send` - Send notification

## Socket.io Events

### Client to Server
- `join_chat` - Join a chat room
- `send_message` - Send a message
- `typing_start` - Start typing indicator
- `typing_stop` - Stop typing indicator
- `mark_message_read` - Mark message as read
- `emergency_alert` - Send emergency alert

### Server to Client
- `new_message` - New message received
- `user_typing` - User is typing
- `user_stopped_typing` - User stopped typing
- `message_read` - Message was read
- `user_online` - User came online
- `user_offline` - User went offline
- `new_notification` - New notification
- `emergency_alert` - Emergency alert received

## Security Features

- Password hashing with bcrypt
- JWT token authentication
- Rate limiting
- CORS protection
- XSS protection
- MongoDB injection prevention
- File upload validation
- Account lockout after failed attempts

## Database Models

### User
- Basic user information
- Authentication data
- Role-based profiles
- Preferences and settings

### Doctor
- Medical license and specialization
- Clinic information
- Working hours and availability
- Services and pricing
- Patient connections
- Secretary management

### Patient
- Medical history and allergies
- Current medications
- Vital signs tracking
- Doctor connections
- Insurance information

### Secretary
- Employment details
- Permissions and access control
- Performance metrics
- Work schedule

### Appointment
- Scheduling information
- Status tracking
- Rescheduling history
- Billing integration

### Consultation
- Medical examination details
- Diagnosis and treatment plans
- Lab and imaging orders
- Referrals to specialists

### Prescription
- Medication details and dosing
- Adherence tracking
- Refill management
- Electronic signatures

### Medical Record
- Lab results and imaging
- Document attachments
- Access control and sharing
- Version history

### Chat & Messages
- Real-time messaging
- File sharing
- Message reactions
- Read receipts

### Notification
- Multi-channel delivery
- Priority levels
- Scheduling and automation
- Delivery tracking

### Bill
- Invoice generation
- Payment tracking
- Insurance claims
- Refund processing

## Environment Variables

See `.env.example` for all required environment variables including:
- Database connection
- JWT secrets
- Email configuration
- SMS configuration
- File upload settings
- Security settings

## Sample Data

Run the seed script to create sample accounts:
```bash
npm run seed
```

This creates:
- Admin account: admin@doktor.com / Admin123!@#
- Doctor account: doctor@doktor.com / Doctor123!@#
- Patient account: patient@doktor.com / Patient123!@#
- Secretary account: secretary@doktor.com / Secretary123!@#

## Development

The API includes comprehensive error handling, validation, logging, and development tools. Use the development server with auto-reload:

```bash
npm run dev
```

## Production Deployment

1. Set `NODE_ENV=production`
2. Configure production database
3. Set up proper SSL certificates
4. Configure reverse proxy (nginx)
5. Set up monitoring and logging
6. Configure backup strategies

## API Documentation

The API follows RESTful conventions with consistent response formats:

```json
{
  "status": "success|fail|error",
  "message": "Human readable message",
  "data": {
    // Response data
  },
  "pagination": {
    // Pagination info for list endpoints
  }
}
```

All endpoints return appropriate HTTP status codes and error messages for proper client handling.