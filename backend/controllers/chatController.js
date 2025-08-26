const { Chat, Message } = require("../models/Chat");
const User = require("../models/User");
const { AppError } = require("../utils/appError");
const { catchAsync } = require("../utils/catchAsync");

// Get user's chats
const getUserChats = catchAsync(async (req, res, next) => {
  const { page = 1, limit = 20, search } = req.query;

  let query = {
    "participants.user": req.user._id,
    "participants.isActive": true,
    isActive: true,
  };

  if (search) {
    query.$or = [
      { title: { $regex: search, $options: "i" } },
      { description: { $regex: search, $options: "i" } },
    ];
  }

  const chats = await Chat.find(query)
    .populate({
      path: "participants.user",
      select: "firstName lastName avatar role isActive",
      match: { isActive: true },
    })
    .populate("lastMessage")
    .sort({ lastActivity: -1 })
    .limit(limit * 1)
    .skip((page - 1) * limit);

  // Filter out chats where user population failed
  const validChats = chats.filter((chat) =>
    chat.participants.every((p) => p.user !== null)
  );

  // Add unread count for each chat
  for (let chat of validChats) {
    const unreadCount = await Message.countDocuments({
      chat: chat._id,
      "readBy.user": { $ne: req.user._id },
      sender: { $ne: req.user._id },
      isDeleted: false,
    });
    chat.unreadCount = unreadCount;
  }

  const total = await Chat.countDocuments(query);

  res.status(200).json({
    status: "success",
    results: validChats.length,
    pagination: {
      page: parseInt(page),
      limit: parseInt(limit),
      total,
      pages: Math.ceil(total / limit),
    },
    data: {
      chats: validChats,
    },
  });
});

// Create new chat
const createChat = catchAsync(async (req, res, next) => {
  const { participantIds, chatType = "direct", title, description } = req.body;

  if (!participantIds || participantIds.length === 0) {
    return next(new AppError("At least one participant is required", 400));
  }

  // Verify all participants exist
  const participants = await User.find({
    _id: { $in: participantIds },
    isActive: true,
  });
  if (participants.length !== participantIds.length) {
    return next(new AppError("One or more participants not found", 400));
  }

  // For direct chats, check if chat already exists
  if (chatType === "direct" && participantIds.length === 1) {
    const existingChat = await Chat.findOne({
      chatType: "direct",
      "participants.user": { $all: [req.user._id, participantIds[0]] },
      "participants.isActive": true,
      isActive: true,
    }).populate("participants.user", "firstName lastName avatar role");

    if (existingChat) {
      return res.status(200).json({
        status: "success",
        message: "Chat already exists",
        data: {
          chat: existingChat,
        },
      });
    }
  }

  // Create participants array
  const chatParticipants = [
    {
      user: req.user._id,
      role: req.user.role,
      joinedAt: new Date(),
      isActive: true,
    },
    ...participantIds.map((id) => ({
      user: id,
      role: participants.find((p) => p._id.toString() === id).role,
      joinedAt: new Date(),
      isActive: true,
    })),
  ];

  const chat = await Chat.create({
    chatId: `${req.user._id}-${participantIds.join("-")}-${Date.now()}`,
    participants: chatParticipants,
    chatType,
    title,
    description,
    lastActivity: new Date(),
  });

  await chat.populate("participants.user", "firstName lastName avatar role");

  res.status(201).json({
    status: "success",
    message: "Chat created successfully",
    data: {
      chat,
    },
  });
});

// Get chat by ID
const getChatById = catchAsync(async (req, res, next) => {
  const { chatId } = req.params;

  const chat = await Chat.findById(chatId)
    .populate("participants.user", "firstName lastName avatar role")
    .populate("lastMessage");

  if (!chat) {
    return next(new AppError("Chat not found", 404));
  }

  // Check if user is participant
  const isParticipant = chat.participants.some(
    (p) => p.user._id.toString() === req.user._id.toString() && p.isActive
  );

  if (!isParticipant) {
    return next(new AppError("Access denied to this chat", 403));
  }

  res.status(200).json({
    status: "success",
    data: {
      chat,
    },
  });
});

// Get chat messages
const getChatMessages = catchAsync(async (req, res, next) => {
  const { chatId } = req.params;
  const { page = 1, limit = 50, before, after } = req.query;

  // Verify chat access
  const chat = await Chat.findById(chatId);
  if (!chat) {
    return next(new AppError("Chat not found", 404));
  }

  const isParticipant = chat.participants.some(
    (p) => p.user._id.toString() === req.user._id.toString() && p.isActive
  );

  if (!isParticipant) {
    return next(new AppError("Access denied to this chat", 403));
  }

  let query = { chat: chatId, isDeleted: false };

  if (before) {
    query.createdAt = { $lt: new Date(before) };
  } else if (after) {
    query.createdAt = { $gt: new Date(after) };
  }

  const [messages, total] = await Promise.all([
    Message.find(query)
      .populate("sender", "firstName lastName avatar role")
      .populate("replyTo", "content sender")
      .sort({ createdAt: before ? -1 : 1 })
      .limit(limit * 1)
      .skip((page - 1) * limit),

    Message.countDocuments({ chat: chatId, isDeleted: false }),
  ]);

  // Mark messages as delivered to current user
  await Message.updateMany(
    {
      chat: chatId,
      sender: { $ne: req.user._id },
      "deliveredTo.user": { $ne: req.user._id },
      isDeleted: false,
    },
    {
      $push: {
        deliveredTo: {
          user: req.user._id,
          deliveredAt: new Date(),
        },
      },
    }
  );

  res.status(200).json({
    status: "success",
    results: messages.length,
    pagination: {
      page: parseInt(page),
      limit: parseInt(limit),
      total,
      pages: Math.ceil(total / limit),
      hasMore: messages.length === limit,
    },
    data: {
      messages: before ? messages.reverse() : messages,
    },
  });
});

// Send message
const sendMessage = catchAsync(async (req, res, next) => {
  const { chatId } = req.params;
  const { messageType = "text", content, replyTo } = req.body;

  // Verify chat access
  const chat = await Chat.findById(chatId);
  if (!chat) {
    return next(new AppError("Chat not found", 404));
  }

  const isParticipant = chat.participants.some(
    (p) => p.user._id.toString() === req.user._id.toString() && p.isActive
  );

  if (!isParticipant) {
    return next(new AppError("Access denied to this chat", 403));
  }

  const message = await Message.create({
    chat: chatId,
    messageId: `${chatId}-${Date.now()}`,
    sender: req.user._id,
    messageType,
    content,
    replyTo: replyTo || null,
  });

  await message.populate("sender", "firstName lastName avatar role");
  if (replyTo) {
    await message.populate("replyTo", "content sender");
  }

  // Update chat's last message and activity
  chat.lastMessage = message._id;
  chat.lastActivity = new Date();
  await chat.save();

  res.status(201).json({
    status: "success",
    message: "Message sent successfully",
    data: {
      message,
    },
  });
});

// Send file message
const sendFileMessage = catchAsync(async (req, res, next) => {
  const { chatId } = req.params;

  if (!req.file) {
    return next(new AppError("No file uploaded", 400));
  }

  // Verify chat access
  const chat = await Chat.findById(chatId);
  if (!chat) {
    return next(new AppError("Chat not found", 404));
  }

  const isParticipant = chat.participants.some(
    (p) => p.user._id.toString() === req.user._id.toString() && p.isActive
  );

  if (!isParticipant) {
    return next(new AppError("Access denied to this chat", 403));
  }

  const message = await Message.create({
    chat: chatId,
    sender: req.user._id,
    messageType: "file",
    content: {
      file: {
        filename: req.file.filename,
        originalName: req.file.originalname,
        mimetype: req.file.mimetype,
        size: req.file.size,
        url: req.file.path,
      },
    },
  });

  await message.populate("sender", "firstName lastName avatar role");

  // Update chat's last message and activity
  chat.lastMessage = message._id;
  chat.lastActivity = new Date();
  await chat.save();

  res.status(201).json({
    status: "success",
    message: "File message sent successfully",
    data: {
      message,
    },
  });
});

// Edit message
const editMessage = catchAsync(async (req, res, next) => {
  const { messageId } = req.params;
  const { content } = req.body;

  const message = await Message.findById(messageId);
  if (!message) {
    return next(new AppError("Message not found", 404));
  }

  // Check if user is the sender
  if (message.sender.toString() !== req.user._id.toString()) {
    return next(new AppError("You can only edit your own messages", 403));
  }

  // Store previous content in edit history
  message.editHistory.push({
    previousContent: message.content,
    editedAt: new Date(),
    reason: "User edit",
  });

  message.content = content;
  message.isEdited = true;
  await message.save();

  res.status(200).json({
    status: "success",
    message: "Message updated successfully",
    data: {
      message,
    },
  });
});

// Delete message
const deleteMessage = catchAsync(async (req, res, next) => {
  const { messageId } = req.params;

  const message = await Message.findById(messageId);
  if (!message) {
    return next(new AppError("Message not found", 404));
  }

  // Check if user is the sender or has admin privileges
  if (
    message.sender.toString() !== req.user._id.toString() &&
    req.user.role !== "admin"
  ) {
    return next(new AppError("You can only delete your own messages", 403));
  }

  message.isDeleted = true;
  message.deletedAt = new Date();
  message.deletedBy = req.user._id;
  await message.save();

  res.status(200).json({
    status: "success",
    message: "Message deleted successfully",
  });
});

// Add reaction to message
const addReaction = catchAsync(async (req, res, next) => {
  const { messageId } = req.params;
  const { emoji } = req.body;

  const message = await Message.findById(messageId);
  if (!message) {
    return next(new AppError("Message not found", 404));
  }

  // Check if user already reacted with this emoji
  const existingReaction = message.reactions.find(
    (r) => r.user.toString() === req.user._id.toString() && r.emoji === emoji
  );

  if (existingReaction) {
    return next(new AppError("You already reacted with this emoji", 400));
  }

  message.reactions.push({
    user: req.user._id,
    emoji,
    addedAt: new Date(),
  });

  await message.save();

  res.status(200).json({
    status: "success",
    message: "Reaction added successfully",
    data: {
      message,
    },
  });
});

// Remove reaction from message
const removeReaction = catchAsync(async (req, res, next) => {
  const { messageId } = req.params;
  const { emoji } = req.body;

  const message = await Message.findById(messageId);
  if (!message) {
    return next(new AppError("Message not found", 404));
  }

  message.reactions = message.reactions.filter(
    (r) => !(r.user.toString() === req.user._id.toString() && r.emoji === emoji)
  );

  await message.save();

  res.status(200).json({
    status: "success",
    message: "Reaction removed successfully",
    data: {
      message,
    },
  });
});

// Add participant to chat
const addParticipant = catchAsync(async (req, res, next) => {
  const { chatId } = req.params;
  const { userId } = req.body;

  const chat = await Chat.findById(chatId);
  if (!chat) {
    return next(new AppError("Chat not found", 404));
  }

  const user = await User.findById(userId);
  if (!user) {
    return next(new AppError("User not found", 404));
  }

  // Check if user is already a participant
  const existingParticipant = chat.participants.find(
    (p) => p.user.toString() === userId
  );

  if (existingParticipant) {
    if (existingParticipant.isActive) {
      return next(new AppError("User is already a participant", 400));
    } else {
      // Reactivate participant
      existingParticipant.isActive = true;
      existingParticipant.joinedAt = new Date();
    }
  } else {
    // Add new participant
    chat.participants.push({
      user: userId,
      role: user.role,
      joinedAt: new Date(),
      isActive: true,
    });
  }

  await chat.save();

  res.status(200).json({
    status: "success",
    message: "Participant added successfully",
    data: {
      chat,
    },
  });
});

// Remove participant from chat
const removeParticipant = catchAsync(async (req, res, next) => {
  const { chatId, userId } = req.params;

  const chat = await Chat.findById(chatId);
  if (!chat) {
    return next(new AppError("Chat not found", 404));
  }

  const participant = chat.participants.find(
    (p) => p.user.toString() === userId
  );

  if (!participant) {
    return next(new AppError("Participant not found", 404));
  }

  participant.isActive = false;
  participant.leftAt = new Date();

  await chat.save();

  res.status(200).json({
    status: "success",
    message: "Participant removed successfully",
  });
});

// Update chat settings
const updateChatSettings = catchAsync(async (req, res, next) => {
  const { chatId } = req.params;
  const { settings } = req.body;

  const chat = await Chat.findByIdAndUpdate(
    chatId,
    { settings },
    { new: true, runValidators: true }
  );

  if (!chat) {
    return next(new AppError("Chat not found", 404));
  }

  res.status(200).json({
    status: "success",
    message: "Chat settings updated successfully",
    data: {
      chat,
    },
  });
});

// Search messages in chat
const searchMessages = catchAsync(async (req, res, next) => {
  const { chatId } = req.params;
  const { query, page = 1, limit = 20 } = req.query;

  if (!query) {
    return next(new AppError("Search query is required", 400));
  }

  const messages = await Message.find({
    chat: chatId,
    "content.text": { $regex: query, $options: "i" },
    isDeleted: false,
  })
    .populate("sender", "firstName lastName avatar role")
    .sort({ createdAt: -1 })
    .limit(limit * 1)
    .skip((page - 1) * limit);

  res.status(200).json({
    status: "success",
    results: messages.length,
    data: {
      messages,
    },
  });
});

// Mark messages as read
const markMessagesAsRead = catchAsync(async (req, res, next) => {
  const { chatId } = req.params;
  const { messageIds } = req.body;

  if (!messageIds || messageIds.length === 0) {
    return next(new AppError("Message IDs are required", 400));
  }

  await Message.updateMany(
    {
      _id: { $in: messageIds },
      chat: chatId,
      "readBy.user": { $ne: req.user._id },
    },
    {
      $push: {
        readBy: {
          user: req.user._id,
          readAt: new Date(),
        },
      },
    }
  );

  res.status(200).json({
    status: "success",
    message: "Messages marked as read",
  });
});

// Get chat statistics
const getChatStats = catchAsync(async (req, res, next) => {
  const { chatId } = req.params;

  const chat = await Chat.findById(chatId);
  if (!chat) {
    return next(new AppError("Chat not found", 404));
  }

  const stats = await Message.aggregate([
    { $match: { chat: mongoose.Types.ObjectId(chatId), isDeleted: false } },
    {
      $group: {
        _id: null,
        totalMessages: { $sum: 1 },
        messagesByType: {
          $push: "$messageType",
        },
        messagesBySender: {
          $push: "$sender",
        },
        firstMessage: { $min: "$createdAt" },
        lastMessage: { $max: "$createdAt" },
      },
    },
  ]);

  res.status(200).json({
    status: "success",
    data: {
      stats: stats[0] || {},
    },
  });
});

// Update chat
const updateChat = catchAsync(async (req, res, next) => {
  const { chatId } = req.params;
  const { title, description } = req.body;

  const chat = await Chat.findByIdAndUpdate(
    chatId,
    { title, description },
    { new: true, runValidators: true }
  );

  if (!chat) {
    return next(new AppError("Chat not found", 404));
  }

  res.status(200).json({
    status: "success",
    message: "Chat updated successfully",
    data: {
      chat,
    },
  });
});

// Delete chat
const deleteChat = catchAsync(async (req, res, next) => {
  const { chatId } = req.params;

  const chat = await Chat.findById(chatId);
  if (!chat) {
    return next(new AppError("Chat not found", 404));
  }

  // Only allow deletion by doctors or admins
  if (req.user.role !== "doctor" && req.user.role !== "admin") {
    return next(new AppError("Only doctors can delete chats", 403));
  }

  chat.isActive = false;
  await chat.save();

  res.status(200).json({
    status: "success",
    message: "Chat deleted successfully",
  });
});

// Update participant role
const updateParticipantRole = catchAsync(async (req, res, next) => {
  const { chatId, userId } = req.params;
  const { role } = req.body;

  const chat = await Chat.findById(chatId);
  if (!chat) {
    return next(new AppError("Chat not found", 404));
  }

  const participant = chat.participants.find(
    (p) => p.user.toString() === userId
  );

  if (!participant) {
    return next(new AppError("Participant not found", 404));
  }

  participant.role = role;
  await chat.save();

  res.status(200).json({
    status: "success",
    message: "Participant role updated successfully",
  });
});

module.exports = {
  getUserChats,
  createChat,
  getChatById,
  getChatMessages,
  sendMessage,
  sendFileMessage,
  editMessage,
  deleteMessage,
  addReaction,
  removeReaction,
  addParticipant,
  removeParticipant,
  updateParticipantRole,
  updateChatSettings,
  searchMessages,
  markMessagesAsRead,
  getChatStats,
  updateChat,
  deleteChat,
};
