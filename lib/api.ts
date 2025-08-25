import axios from 'axios';

// Create axios instance with base configuration
const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api/v1',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle token refresh
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const refreshToken = localStorage.getItem('refreshToken');
        if (refreshToken) {
          const response = await axios.post(
            `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api/v1'}/auth/refresh-token`,
            { refreshToken }
          );

          const { token, refreshToken: newRefreshToken } = response.data;
          localStorage.setItem('token', token);
          localStorage.setItem('refreshToken', newRefreshToken);

          originalRequest.headers.Authorization = `Bearer ${token}`;
          return api(originalRequest);
        }
      } catch (refreshError) {
        localStorage.removeItem('token');
        localStorage.removeItem('refreshToken');
        window.location.href = '/auth/signin';
      }
    }

    return Promise.reject(error);
  }
);

// Auth API
export const authAPI = {
  register: (data: any) => api.post('/auth/register', data),
  login: (data: any) => api.post('/auth/login', data),
  logout: () => api.post('/auth/logout'),
  forgotPassword: (email: string) => api.post('/auth/forgot-password', { email }),
  resetPassword: (data: any) => api.post('/auth/reset-password', data),
  verifyOTP: (data: any) => api.post('/auth/verify-otp', data),
  resendOTP: (data: any) => api.post('/auth/resend-otp', data),
  refreshToken: (refreshToken: string) => api.post('/auth/refresh-token', { refreshToken }),
  getMe: () => api.get('/auth/me'),
  updatePassword: (data: any) => api.patch('/auth/update-password', data),
  updateProfile: (data: any) => api.patch('/auth/update-profile', data),
};

// Users API
export const usersAPI = {
  getProfile: () => api.get('/users/profile'),
  updateProfile: (data: any) => api.patch('/users/profile', data),
  uploadAvatar: (formData: FormData) => api.post('/users/avatar', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
  deleteAvatar: () => api.delete('/users/avatar'),
  getUsers: (params?: any) => api.get('/users', { params }),
  searchUsers: (params: any) => api.get('/users/search', { params }),
  getUserById: (id: string) => api.get(`/users/${id}`),
  updateUser: (id: string, data: any) => api.patch(`/users/${id}`, data),
  deleteUser: (id: string) => api.delete(`/users/${id}`),
  activateUser: (id: string) => api.patch(`/users/${id}/activate`),
  deactivateUser: (id: string) => api.patch(`/users/${id}/deactivate`),
};

// Doctors API
export const doctorsAPI = {
  searchDoctors: (params?: any) => api.get('/doctors/search', { params }),
  getSpecializations: () => api.get('/doctors/specializations'),
  getDoctors: (params?: any) => api.get('/doctors', { params }),
  getDoctorProfile: () => api.get('/doctors/profile'),
  updateDoctorProfile: (data: any) => api.patch('/doctors/profile', data),
  getDoctorPatients: () => api.get('/doctors/patients'),
  getDoctorStatistics: () => api.get('/doctors/statistics'),
  addService: (data: any) => api.post('/doctors/services', data),
  updateService: (serviceId: string, data: any) => api.patch(`/doctors/services/${serviceId}`, data),
  deleteService: (serviceId: string) => api.delete(`/doctors/services/${serviceId}`),
  updateWorkingHours: (data: any) => api.patch('/doctors/working-hours', data),
  addUnavailability: (data: any) => api.post('/doctors/unavailability', data),
  removeUnavailability: (id: string) => api.delete(`/doctors/unavailability/${id}`),
  getDoctorById: (id: string) => api.get(`/doctors/${id}`),
  connectToDoctor: (id: string, data?: any) => api.post(`/doctors/${id}/connect`, data),
  disconnectFromDoctor: (id: string) => api.post(`/doctors/${id}/disconnect`),
  rateDoctor: (id: string, data: any) => api.post(`/doctors/${id}/rate`, data),
};

// Patients API
export const patientsAPI = {
  getPatientProfile: () => api.get('/patients/profile'),
  updatePatientProfile: (data: any) => api.patch('/patients/profile', data),
  getPatientDoctors: () => api.get('/patients/doctors'),
  getMedicalHistory: () => api.get('/patients/medical-history'),
  updateMedicalHistory: (data: any) => api.patch('/patients/medical-history', data),
  getCurrentMedications: () => api.get('/patients/medications'),
  getVitalSigns: (params?: any) => api.get('/patients/vital-signs', { params }),
  addVitalSigns: (data: any) => api.post('/patients/vital-signs', data),
  getPatients: (params?: any) => api.get('/patients', { params }),
  getPatientById: (id: string) => api.get(`/patients/${id}`),
  updatePatient: (id: string, data: any) => api.patch(`/patients/${id}`, data),
  acceptPatientConnection: (id: string) => api.post(`/patients/${id}/connect`),
  disconnectPatient: (id: string) => api.post(`/patients/${id}/disconnect`),
};

// Appointments API
export const appointmentsAPI = {
  getAppointments: (params?: any) => api.get('/appointments', { params }),
  createAppointment: (data: any) => api.post('/appointments', data),
  getDoctorAvailability: (doctorId: string, params?: any) => api.get(`/appointments/availability/${doctorId}`, { params }),
  getCalendarView: (params?: any) => api.get('/appointments/calendar', { params }),
  getUpcomingAppointments: (params?: any) => api.get('/appointments/upcoming', { params }),
  getAppointmentStatistics: (params?: any) => api.get('/appointments/statistics', { params }),
  getAppointmentById: (id: string) => api.get(`/appointments/${id}`),
  updateAppointment: (id: string, data: any) => api.patch(`/appointments/${id}`, data),
  cancelAppointment: (id: string, data?: any) => api.delete(`/appointments/${id}`, { data }),
  rescheduleAppointment: (id: string, data: any) => api.post(`/appointments/${id}/reschedule`, data),
  confirmAppointment: (id: string) => api.post(`/appointments/${id}/confirm`),
  completeAppointment: (id: string) => api.post(`/appointments/${id}/complete`),
  markNoShow: (id: string) => api.post(`/appointments/${id}/no-show`),
  bulkUpdateStatus: (data: any) => api.patch('/appointments/bulk/update-status', data),
  bulkCancel: (data: any) => api.delete('/appointments/bulk/cancel', { data }),
};

// Consultations API
export const consultationsAPI = {
  getConsultations: (params?: any) => api.get('/consultations', { params }),
  createConsultation: (data: any) => api.post('/consultations', data),
  getConsultationStatistics: (params?: any) => api.get('/consultations/statistics', { params }),
  getConsultationById: (id: string) => api.get(`/consultations/${id}`),
  updateConsultation: (id: string, data: any) => api.patch(`/consultations/${id}`, data),
  deleteConsultation: (id: string) => api.delete(`/consultations/${id}`),
  startConsultation: (id: string) => api.post(`/consultations/${id}/start`),
  completeConsultation: (id: string) => api.post(`/consultations/${id}/complete`),
  addDiagnosis: (id: string, data: any) => api.post(`/consultations/${id}/add-diagnosis`, data),
  addPrescription: (id: string, data: any) => api.post(`/consultations/${id}/add-prescription`, data),
  orderLabTest: (id: string, data: any) => api.post(`/consultations/${id}/order-lab`, data),
  orderImaging: (id: string, data: any) => api.post(`/consultations/${id}/order-imaging`, data),
  referToSpecialist: (id: string, data: any) => api.post(`/consultations/${id}/refer`, data),
  generateConsultationReport: (id: string) => api.get(`/consultations/${id}/report`),
};

// Prescriptions API
export const prescriptionsAPI = {
  getPrescriptions: (params?: any) => api.get('/prescriptions', { params }),
  createPrescription: (data: any) => api.post('/prescriptions', data),
  getPrescriptionById: (id: string) => api.get(`/prescriptions/${id}`),
  updatePrescription: (id: string, data: any) => api.patch(`/prescriptions/${id}`, data),
  deletePrescription: (id: string) => api.delete(`/prescriptions/${id}`),
  addMedication: (id: string, data: any) => api.post(`/prescriptions/${id}/medications`, data),
  updateMedication: (id: string, medicationId: string, data: any) => 
    api.patch(`/prescriptions/${id}/medications/${medicationId}`, data),
  removeMedication: (id: string, medicationId: string) => 
    api.delete(`/prescriptions/${id}/medications/${medicationId}`),
  discontinuePrescription: (id: string, data: any) => api.post(`/prescriptions/${id}/discontinue`, data),
  refillPrescription: (id: string) => api.post(`/prescriptions/${id}/refill`),
  generatePrescriptionPDF: (id: string) => api.get(`/prescriptions/${id}/pdf`),
  recordAdherence: (id: string, data: any) => api.post(`/prescriptions/${id}/adherence`, data),
  getAdherenceReport: (id: string) => api.get(`/prescriptions/${id}/adherence-report`),
};

// Medical Records API
export const medicalRecordsAPI = {
  getMedicalRecords: (params?: any) => api.get('/medical-records', { params }),
  createMedicalRecord: (data: any) => api.post('/medical-records', data),
  getRecordTypes: () => api.get('/medical-records/types'),
  getXRayRecords: (params?: any) => api.get('/medical-records/xray', { params }),
  getBloodTestRecords: (params?: any) => api.get('/medical-records/blood-tests', { params }),
  getMedicalRecordById: (id: string) => api.get(`/medical-records/${id}`),
  updateMedicalRecord: (id: string, data: any) => api.patch(`/medical-records/${id}`, data),
  deleteMedicalRecord: (id: string) => api.delete(`/medical-records/${id}`),
  addAttachments: (id: string, formData: FormData) => 
    api.post(`/medical-records/${id}/attachments`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    }),
  removeAttachment: (id: string, attachmentId: string) => 
    api.delete(`/medical-records/${id}/attachments/${attachmentId}`),
  shareRecord: (id: string, data: any) => api.post(`/medical-records/${id}/share`, data),
  revokeAccess: (id: string, userId: string) => api.delete(`/medical-records/${id}/share/${userId}`),
  getAccessLog: (id: string) => api.get(`/medical-records/${id}/access-log`),
  addLabResults: (data: any) => api.post('/medical-records/lab-results', data),
  getLabResults: (patientId: string) => api.get(`/medical-records/lab-results/${patientId}`),
  addImagingResults: (data: any) => api.post('/medical-records/imaging-results', data),
  getImagingResults: (patientId: string) => api.get(`/medical-records/imaging-results/${patientId}`),
};

// Billing API
export const billingAPI = {
  getBills: (params?: any) => api.get('/billing', { params }),
  createBill: (data: any) => api.post('/billing', data),
  getBillingStatistics: (params?: any) => api.get('/billing/statistics', { params }),
  getRevenueReport: (params?: any) => api.get('/billing/revenue-report', { params }),
  getBillById: (id: string) => api.get(`/billing/${id}`),
  updateBill: (id: string, data: any) => api.patch(`/billing/${id}`, data),
  deleteBill: (id: string) => api.delete(`/billing/${id}`),
  recordPayment: (id: string, data: any) => api.post(`/billing/${id}/payment`, data),
  processRefund: (id: string, data: any) => api.post(`/billing/${id}/refund`, data),
  sendPaymentReminder: (id: string) => api.post(`/billing/${id}/send-reminder`),
  bulkUpdatePaymentStatus: (data: any) => api.patch('/billing/bulk/update-status', data),
};

// Chat API
export const chatAPI = {
  getUserChats: (params?: any) => api.get('/chat', { params }),
  createChat: (data: any) => api.post('/chat', data),
  getChatById: (chatId: string) => api.get(`/chat/${chatId}`),
  updateChat: (chatId: string, data: any) => api.patch(`/chat/${chatId}`, data),
  deleteChat: (chatId: string) => api.delete(`/chat/${chatId}`),
  getChatMessages: (chatId: string, params?: any) => api.get(`/chat/${chatId}/messages`, { params }),
  sendMessage: (chatId: string, data: any) => api.post(`/chat/${chatId}/messages`, data),
  sendFileMessage: (chatId: string, formData: FormData) => 
    api.post(`/chat/${chatId}/messages/file`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    }),
  editMessage: (messageId: string, data: any) => api.patch(`/chat/messages/${messageId}`, data),
  deleteMessage: (messageId: string) => api.delete(`/chat/messages/${messageId}`),
  addReaction: (messageId: string, data: any) => api.post(`/chat/messages/${messageId}/react`, data),
  removeReaction: (messageId: string, data: any) => api.delete(`/chat/messages/${messageId}/react`, { data }),
  addParticipant: (chatId: string, data: any) => api.post(`/chat/${chatId}/participants`, data),
  removeParticipant: (chatId: string, userId: string) => api.delete(`/chat/${chatId}/participants/${userId}`),
  updateParticipantRole: (chatId: string, userId: string, data: any) => 
    api.patch(`/chat/${chatId}/participants/${userId}`, data),
  updateChatSettings: (chatId: string, data: any) => api.patch(`/chat/${chatId}/settings`, data),
  searchMessages: (chatId: string, params: any) => api.get(`/chat/${chatId}/search`, { params }),
  markMessagesAsRead: (chatId: string, data: any) => api.post(`/chat/${chatId}/mark-read`, data),
  getChatStats: (chatId: string) => api.get(`/chat/${chatId}/stats`),
};

// Notifications API
export const notificationsAPI = {
  getNotifications: (params?: any) => api.get('/notifications', { params }),
  getUnreadCount: () => api.get('/notifications/unread-count'),
  markAsRead: (id: string) => api.patch(`/notifications/${id}/read`),
  markAllAsRead: () => api.patch('/notifications/mark-all-read'),
  deleteNotification: (id: string) => api.delete(`/notifications/${id}`),
  sendNotification: (data: any) => api.post('/notifications/send', data),
  getNotificationPreferences: () => api.get('/notifications/preferences'),
  updateNotificationPreferences: (data: any) => api.patch('/notifications/preferences', data),
  bulkMarkAsRead: (data: any) => api.patch('/notifications/bulk/read', data),
  bulkDelete: (data: any) => api.delete('/notifications/bulk/delete', { data }),
};

// Secretaries API
export const secretariesAPI = {
  getSecretaries: () => api.get('/secretaries'),
  addSecretary: (data: any) => api.post('/secretaries', data),
  getSecretaryProfile: () => api.get('/secretaries/profile'),
  updateSecretaryProfile: (data: any) => api.patch('/secretaries/profile', data),
  getSecretaryById: (id: string) => api.get(`/secretaries/${id}`),
  updateSecretary: (id: string, data: any) => api.patch(`/secretaries/${id}`, data),
  removeSecretary: (id: string) => api.delete(`/secretaries/${id}`),
  updatePermissions: (id: string, data: any) => api.patch(`/secretaries/${id}/permissions`, data),
  activateSecretary: (id: string) => api.patch(`/secretaries/${id}/activate`),
  deactivateSecretary: (id: string) => api.patch(`/secretaries/${id}/deactivate`),
  getSecretaryPerformance: (id: string) => api.get(`/secretaries/${id}/performance`),
  rateSecretary: (id: string, data: any) => api.post(`/secretaries/${id}/performance/rate`, data),
};

// Dashboard API
export const dashboardAPI = {
  getDoctorDashboardStats: () => api.get('/dashboard/doctor/stats'),
  getPatientStats: () => api.get('/dashboard/patient/stats'),
};

export default api;