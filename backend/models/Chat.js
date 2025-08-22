const mongoose = require('mongoose');

const chatSchema = new mongoose.Schema({
  chatId: {
    type: String,
    unique: true,
    required: true
  },
  participants: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    role: {
      type: String,
      enum: ['patient', 'doctor', 'secretary']
    },
    joinedAt: {
      type: Date,
      default: Date.now
    },
    leftAt: Date,
    isActive: {
      type: Boolean,
      default: true
    },
    lastSeen: {
      type: Date,
      default: Date.now
    }
  }],
  chatType: {
    type: String,
    enum: ['direct', 'group', 'consultation', 'emergency'],
    default: 'direct'
  },
  title: String, // For group chats
  description: String,
  isActive: {
    type: Boolean,
    default: true
  },
  lastMessage: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Message'
  },
  lastActivity: {
    type: Date,
    default: Date.now
  },
  settings: {
    allowFileSharing: {
      type: Boolean,
      default: true
    },
    allowImageSharing: {
      type: Boolean,
      default: true
    },
    isEncrypted: {
      type: Boolean,
      default: true
    },
    retentionPeriod: {
      type: Number,
      default: 365 // days
    }
  },
  metadata: {
    relatedAppointment: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Appointment'
    },
    relatedConsultation: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Consultation'
    },
    priority: {
      type: String,
      enum: ['low', 'normal', 'high', 'urgent'],
      default: 'normal'
    }
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

const messageSchema = new mongoose.Schema({
  messageId: {
    type: String,
    unique: true,
    required: true
  },
  chat: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Chat',
    required: true
  },
  sender: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  messageType: {
    type: String,
    enum: ['text', 'image', 'file', 'audio', 'video', 'location', 'system'],
    default: 'text'
  },
  content: {
    text: String,
    file: {
      filename: String,
      originalName: String,
      mimetype: String,
      size: Number,
      url: String
    },
    location: {
      latitude: Number,
      longitude: Number,
      address: String
    },
    system: {
      type: String,
      data: mongoose.Schema.Types.Mixed
    }
  },
  replyTo: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Message'
  },
  reactions: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    emoji: String,
    addedAt: {
      type: Date,
      default: Date.now
    }
  }],
  readBy: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    readAt: {
      type: Date,
      default: Date.now
    }
  }],
  deliveredTo: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    deliveredAt: {
      type: Date,
      default: Date.now
    }
  }],
  isEdited: {
    type: Boolean,
    default: false
  },
  editHistory: [{
    previousContent: String,
    editedAt: Date,
    reason: String
  }],
  isDeleted: {
    type: Boolean,
    default: false
  },
  deletedAt: Date,
  deletedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  priority: {
    type: String,
    enum: ['low', 'normal', 'high', 'urgent'],
    default: 'normal'
  },
  encryption: {
    isEncrypted: Boolean,
    algorithm: String,
    keyId: String
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Pre-save middleware to generate IDs
chatSchema.pre('save', async function(next) {
  if (!this.chatId) {
    const count = await mongoose.model('Chat').countDocuments();
    this.chatId = `CHAT-${String(count + 1).padStart(6, '0')}`;
  }
  next();
});

messageSchema.pre('save', async function(next) {
  if (!this.messageId) {
    const count = await mongoose.model('Message').countDocuments();
    this.messageId = `MSG-${String(count + 1).padStart(8, '0')}`;
  }
  next();
});

// Indexes
chatSchema.index({ 'participants.user': 1 });
chatSchema.index({ 'chatType': 1 });
chatSchema.index({ 'lastActivity': -1 });

messageSchema.index({ 'chat': 1 });
messageSchema.index({ 'sender': 1 });
messageSchema.index({ 'createdAt': -1 });
messageSchema.index({ 'chat': 1, 'createdAt': -1 });

const Chat = mongoose.model('Chat', chatSchema);
const Message = mongoose.model('Message', messageSchema);

module.exports = { Chat, Message };