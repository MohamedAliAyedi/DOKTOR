const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { Chat, Message } = require('../models/Chat');
const Notification = require('../models/Notification');

// Store active connections
const activeConnections = new Map();

const initializeSocket = (io) => {
  // Authentication middleware for socket connections
  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth.token;
      
      if (!token) {
        return next(new Error('Authentication error: No token provided'));
      }

      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = await User.findById(decoded.id).select('-password');
      
      if (!user || !user.isActive) {
        return next(new Error('Authentication error: Invalid user'));
      }

      socket.userId = user._id.toString();
      socket.user = user;
      next();
    } catch (error) {
      next(new Error('Authentication error: Invalid token'));
    }
  });

  io.on('connection', (socket) => {
    console.log(`User ${socket.user.fullName} connected (${socket.userId})`);
    
    // Store active connection
    activeConnections.set(socket.userId, {
      socketId: socket.id,
      user: socket.user,
      connectedAt: new Date(),
      lastActivity: new Date()
    });

    // Join user to their personal room
    socket.join(`user_${socket.userId}`);

    // Emit online status to relevant users
    io.emit('user_online', {
      userId: socket.userId,
      user: {
        id: socket.user._id,
        fullName: socket.user.fullName,
        role: socket.user.role,
        avatar: socket.user.avatar
      }
    });

    // Send current online users to the newly connected user
    const onlineUsers = Array.from(activeConnections.values()).map(conn => ({
      userId: conn.user._id.toString(),
      user: {
        id: conn.user._id,
        fullName: conn.user.fullName,
        role: conn.user.role,
        avatar: conn.user.avatar
      }
    }));
    
    socket.emit('online_users_list', { users: onlineUsers });

    // Handle joining chat rooms
    socket.on('join_chat', async (data) => {
      try {
        const { chatId } = data;
        
        // Verify user is participant in this chat
        const chat = await Chat.findById(chatId);
        if (!chat) {
          socket.emit('error', { message: 'Chat not found' });
          return;
        }

        const isParticipant = chat.participants.some(
          p => p.user.toString() === socket.userId && p.isActive
        );

        if (!isParticipant) {
          socket.emit('error', { message: 'Access denied to this chat' });
          return;
        }

        socket.join(`chat_${chatId}`);
        
        // Update last seen
        await Chat.findByIdAndUpdate(chatId, {
          $set: {
            'participants.$[elem].lastSeen': new Date()
          }
        }, {
          arrayFilters: [{ 'elem.user': socket.userId }]
        });

        socket.emit('joined_chat', { chatId });
      } catch (error) {
        socket.emit('error', { message: 'Failed to join chat' });
      }
    });

    // Handle sending messages
    socket.on('send_message', async (data) => {
      try {
        const { chatId, messageType, content, replyTo } = data;

        // Verify chat access
        const chat = await Chat.findById(chatId);
        if (!chat) {
          socket.emit('error', { message: 'Chat not found' });
          return;
        }

        const isParticipant = chat.participants.some(
          p => p.user.toString() === socket.userId && p.isActive
        );

        if (!isParticipant) {
          socket.emit('error', { message: 'Access denied to this chat' });
          return;
        }

        // Create message
        const message = await Message.create({
          chat: chatId,
          sender: socket.userId,
          messageType: messageType || 'text',
          content,
          replyTo: replyTo || null
        });

        // Populate sender info
        await message.populate('sender', 'firstName lastName avatar role');
        if (replyTo) {
          await message.populate('replyTo', 'content sender');
        }

        // Update chat's last message and activity
        chat.lastMessage = message._id;
        chat.lastActivity = new Date();
        await chat.save();

        // Mark as delivered to all participants except sender
        const otherParticipants = chat.participants.filter(p => 
          p.user.toString() !== socket.userId && p.isActive
        );
        
        const deliveredTo = otherParticipants.map(p => ({
          user: p.user,
          deliveredAt: new Date()
        }));
        
        message.deliveredTo = deliveredTo;
        await message.save();

        // Emit message to all chat participants
        io.to(`chat_${chatId}`).emit('new_message', {
          message: message.toObject(),
          chat: {
            id: chat._id,
            chatId: chat.chatId
          }
        });

        // Send push notifications to offline users
        const offlineParticipants = chat.participants.filter(p => 
          p.user.toString() !== socket.userId && 
          !activeConnections.has(p.user.toString())
        );

        for (const participant of offlineParticipants) {
          await Notification.create({
            recipient: participant.user,
            sender: socket.userId,
            type: 'new-message',
            title: 'New Message',
            message: `${socket.user.fullName} sent you a message`,
            data: {
              chatId: chat._id,
              messageId: message._id
            },
            relatedEntities: {
              // Add related entities if needed
            }
          });
        }

      } catch (error) {
        console.error('Send message error:', error);
        socket.emit('error', { message: 'Failed to send message' });
      }
    });

    // Handle message read receipts
    socket.on('mark_message_read', async (data) => {
      try {
        const { messageId } = data;

        const message = await Message.findById(messageId);
        if (!message) {
          socket.emit('error', { message: 'Message not found' });
          return;
        }

        // Add read receipt if not already read by this user
        const alreadyRead = message.readBy.some(
          r => r.user.toString() === socket.userId
        );

        if (!alreadyRead) {
          message.readBy.push({
            user: socket.userId,
            readAt: new Date()
          });
          await message.save();

          // Notify sender about read receipt
          io.to(`chat_${message.chat}`).emit('message_read', {
            messageId: message._id,
            readBy: socket.userId,
            readAt: new Date()
          });
        }
      } catch (error) {
        socket.emit('error', { message: 'Failed to mark message as read' });
      }
    });

    // Handle typing indicators
    socket.on('typing_start', (data) => {
      const { chatId } = data;
      socket.to(`chat_${chatId}`).emit('user_typing', {
        userId: socket.userId,
        user: {
          fullName: socket.user.fullName,
          avatar: socket.user.avatar
        }
      });
    });

    socket.on('typing_stop', (data) => {
      const { chatId } = data;
      socket.to(`chat_${chatId}`).emit('user_stopped_typing', {
        userId: socket.userId
      });
    });

    // Handle appointment updates
    socket.on('appointment_update', (data) => {
      const { appointmentId, status, participants } = data;
      
      // Notify relevant users about appointment updates
      participants.forEach(participantId => {
        if (participantId !== socket.userId) {
          io.to(`user_${participantId}`).emit('appointment_updated', {
            appointmentId,
            status,
            updatedBy: socket.user.fullName
          });
        }
      });
    });

    // Handle emergency alerts
    socket.on('emergency_alert', async (data) => {
      try {
        const { message, location, severity } = data;

        // Create emergency notification for all connected doctors
        const doctors = await User.find({ role: 'doctor', isActive: true });
        
        for (const doctor of doctors) {
          await Notification.create({
            recipient: doctor._id,
            sender: socket.userId,
            type: 'emergency-alert',
            title: 'Emergency Alert',
            message: `Emergency from ${socket.user.fullName}: ${message}`,
            priority: 'urgent',
            data: {
              location,
              severity,
              patientId: socket.userId
            }
          });

          // Send real-time notification if doctor is online
          if (activeConnections.has(doctor._id.toString())) {
            io.to(`user_${doctor._id}`).emit('emergency_alert', {
              from: socket.user.fullName,
              message,
              location,
              severity,
              timestamp: new Date()
            });
          }
        }

        socket.emit('emergency_alert_sent', {
          message: 'Emergency alert sent to available doctors'
        });
      } catch (error) {
        socket.emit('error', { message: 'Failed to send emergency alert' });
      }
    });

    // Handle consultation status updates
    socket.on('consultation_status', (data) => {
      const { consultationId, status, patientId, doctorId } = data;
      
      // Notify patient and doctor about consultation status
      [patientId, doctorId].forEach(userId => {
        if (userId && userId !== socket.userId) {
          io.to(`user_${userId}`).emit('consultation_status_updated', {
            consultationId,
            status,
            updatedBy: socket.user.fullName,
            timestamp: new Date()
          });
        }
      });
    });

    // Handle real-time notifications
    socket.on('send_notification', async (data) => {
      try {
        const { recipientId, type, title, message, data: notificationData } = data;

        const notification = await Notification.create({
          recipient: recipientId,
          sender: socket.userId,
          type,
          title,
          message,
          data: notificationData || {}
        });

        // Send real-time notification if recipient is online
        if (activeConnections.has(recipientId)) {
          io.to(`user_${recipientId}`).emit('new_notification', {
            notification: notification.toObject()
          });
        }

        socket.emit('notification_sent', {
          notificationId: notification._id
        });
      } catch (error) {
        socket.emit('error', { message: 'Failed to send notification' });
      }
    });

    // Handle activity updates
    socket.on('activity', () => {
      const connection = activeConnections.get(socket.userId);
      if (connection) {
        connection.lastActivity = new Date();
        activeConnections.set(socket.userId, connection);
      }
    });

    // Handle disconnection
    socket.on('disconnect', () => {
      console.log(`User ${socket.user.fullName} disconnected (${socket.userId})`);
      
      // Remove from active connections
      activeConnections.delete(socket.userId);

      // Emit offline status
      io.emit('user_offline', {
        userId: socket.userId,
        lastSeen: new Date()
      });
    });

    // Handle connection errors
    socket.on('error', (error) => {
      console.error('Socket error:', error);
    });
  });

  // Periodic cleanup of inactive connections
  setInterval(() => {
    const now = new Date();
    const inactiveThreshold = 30 * 60 * 1000; // 30 minutes

    for (const [userId, connection] of activeConnections.entries()) {
      if (now - connection.lastActivity > inactiveThreshold) {
        activeConnections.delete(userId);
        io.to(`user_${userId}`).emit('session_timeout');
      }
    }
  }, 5 * 60 * 1000); // Check every 5 minutes

  return io;
};

// Helper function to get online users
const getOnlineUsers = () => {
  return Array.from(activeConnections.values()).map(connection => ({
    userId: connection.user._id,
    fullName: connection.user.fullName,
    role: connection.user.role,
    avatar: connection.user.avatar,
    connectedAt: connection.connectedAt,
    lastActivity: connection.lastActivity
  }));
};

// Helper function to check if user is online
const isUserOnline = (userId) => {
  return activeConnections.has(userId.toString());
};

// Helper function to send notification to user
const sendNotificationToUser = (io, userId, notification) => {
  if (activeConnections.has(userId.toString())) {
    io.to(`user_${userId}`).emit('new_notification', {
      notification
    });
    return true;
  }
  return false;
};

module.exports = {
  initializeSocket,
  getOnlineUsers,
  isUserOnline,
  sendNotificationToUser,
  activeConnections
};