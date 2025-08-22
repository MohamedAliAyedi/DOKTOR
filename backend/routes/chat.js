const express = require('express');
const chatController = require('../controllers/chatController');
const { protect, authorize } = require('../middleware/auth');
const upload = require('../middleware/upload');

const router = express.Router();

// All routes are protected
router.use(protect);

// Chat routes
router.get('/', chatController.getUserChats);
router.post('/', chatController.createChat);
router.get('/:chatId', chatController.getChatById);
router.patch('/:chatId', chatController.updateChat);
router.delete('/:chatId', chatController.deleteChat);

// Message routes
router.get('/:chatId/messages', chatController.getChatMessages);
router.post('/:chatId/messages', chatController.sendMessage);
router.post('/:chatId/messages/file', upload.single('file'), chatController.sendFileMessage);
router.patch('/messages/:messageId', chatController.editMessage);
router.delete('/messages/:messageId', chatController.deleteMessage);
router.post('/messages/:messageId/react', chatController.addReaction);
router.delete('/messages/:messageId/react', chatController.removeReaction);

// Chat participants
router.post('/:chatId/participants', authorize('doctor', 'secretary'), chatController.addParticipant);
router.delete('/:chatId/participants/:userId', authorize('doctor', 'secretary'), chatController.removeParticipant);
router.patch('/:chatId/participants/:userId', authorize('doctor', 'secretary'), chatController.updateParticipantRole);

// Chat settings
router.patch('/:chatId/settings', authorize('doctor', 'secretary'), chatController.updateChatSettings);

// Search messages
router.get('/:chatId/search', chatController.searchMessages);

// Mark messages as read
router.post('/:chatId/mark-read', chatController.markMessagesAsRead);

// Get chat statistics
router.get('/:chatId/stats', authorize('doctor', 'secretary'), chatController.getChatStats);

module.exports = router;