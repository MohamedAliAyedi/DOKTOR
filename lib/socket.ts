import { io, Socket } from 'socket.io-client';

class SocketService {
  private socket: Socket | null = null;
  private token: string | null = null;

  connect(token: string) {
    this.token = token;
    
    this.socket = io(process.env.NEXT_PUBLIC_API_URL?.replace('/api/v1', '') || 'http://localhost:5000', {
      auth: {
        token: token
      },
      transports: ['websocket', 'polling']
    });

    this.socket.on('connect', () => {
      console.log('Connected to server');
    });

    this.socket.on('disconnect', () => {
      console.log('Disconnected from server');
    });

    this.socket.on('error', (error) => {
      console.error('Socket error:', error);
    });

    // Chat events
    this.socket.on('new_message', (data) => {
      // Handle new message
      window.dispatchEvent(new CustomEvent('new_message', { detail: data }));
    });

    this.socket.on('user_typing', (data) => {
      window.dispatchEvent(new CustomEvent('user_typing', { detail: data }));
    });

    this.socket.on('user_stopped_typing', (data) => {
      window.dispatchEvent(new CustomEvent('user_stopped_typing', { detail: data }));
    });

    this.socket.on('message_read', (data) => {
      window.dispatchEvent(new CustomEvent('message_read', { detail: data }));
    });

    this.socket.on('user_online', (data) => {
      window.dispatchEvent(new CustomEvent('user_online', { detail: data }));
    });

    this.socket.on('user_offline', (data) => {
      window.dispatchEvent(new CustomEvent('user_offline', { detail: data }));
    });

    // Notification events
    this.socket.on('new_notification', (data) => {
      window.dispatchEvent(new CustomEvent('new_notification', { detail: data }));
    });

    // Appointment events
    this.socket.on('appointment_updated', (data) => {
      window.dispatchEvent(new CustomEvent('appointment_updated', { detail: data }));
    });

    // Emergency events
    this.socket.on('emergency_alert', (data) => {
      window.dispatchEvent(new CustomEvent('emergency_alert', { detail: data }));
    });

    return this.socket;
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  }

  // Chat methods
  joinChat(chatId: string) {
    this.socket?.emit('join_chat', { chatId });
  }

  sendMessage(chatId: string, messageType: string, content: any, replyTo?: string) {
    this.socket?.emit('send_message', {
      chatId,
      messageType,
      content,
      replyTo
    });
  }

  markMessageRead(messageId: string) {
    this.socket?.emit('mark_message_read', { messageId });
  }

  startTyping(chatId: string) {
    this.socket?.emit('typing_start', { chatId });
  }

  stopTyping(chatId: string) {
    this.socket?.emit('typing_stop', { chatId });
  }

  // Emergency alert
  sendEmergencyAlert(message: string, location?: any, severity?: string) {
    this.socket?.emit('emergency_alert', {
      message,
      location,
      severity
    });
  }

  // Appointment updates
  updateAppointment(appointmentId: string, status: string, participants: string[]) {
    this.socket?.emit('appointment_update', {
      appointmentId,
      status,
      participants
    });
  }

  // Consultation status
  updateConsultationStatus(consultationId: string, status: string, patientId: string, doctorId: string) {
    this.socket?.emit('consultation_status', {
      consultationId,
      status,
      patientId,
      doctorId
    });
  }

  // Send notification
  sendNotification(recipientId: string, type: string, title: string, message: string, data?: any) {
    this.socket?.emit('send_notification', {
      recipientId,
      type,
      title,
      message,
      data
    });
  }

  // Activity tracking
  updateActivity() {
    this.socket?.emit('activity');
  }
}

export const socketService = new SocketService();