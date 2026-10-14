import express from 'express';
import {
  getConversations,
  createOrGetPrivateConversation,
  getMessages,
  sendMessage,
  markAsRead,
  uploadAttachment,
} from '../controllers/messageController.js';
import { authenticate } from '../middleware/auth.js';
import { uploadAttachment as uploadMiddleware } from '../middleware/upload.js';

const router = express.Router();

router.get('/conversations', authenticate, getConversations);
router.post('/conversations/private', authenticate, createOrGetPrivateConversation);
router.get('/conversations/:conversationId/messages', authenticate, getMessages);
router.post('/conversations/:conversationId/messages', authenticate, sendMessage);
router.patch('/conversations/:conversationId/read', authenticate, markAsRead);
router.post('/upload', authenticate, uploadMiddleware.single('file'), uploadAttachment);

export default router;
