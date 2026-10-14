import { Conversation } from '../models/Conversation.js';
import { Message } from '../models/Message.js';
import { User } from '../models/User.js';
import { Team } from '../models/Team.js';
import { emitToRoom, emitToUser } from '../services/socketService.js';
import { createNotification } from '../services/notificationService.js';
import { successResponse, errorResponse } from '../utils/response.js';

export const getConversations = async (req, res, next) => {
  try {
    const userId = req.user._id;

    const conversations = await Conversation.find({
      participants: userId,
    })
      .populate('participants', 'name avatar college course availability')
      .populate('team', 'name leader')
      .populate({
        path: 'lastMessage',
        populate: { path: 'sender', select: 'name' },
      })
      .sort({ lastMessageAt: -1 });

    return successResponse(res, { conversations }, 'Conversations retrieved');
  } catch (err) {
    next(err);
  }
};

export const createOrGetPrivateConversation = async (req, res, next) => {
  try {
    const { recipientId } = req.body;
    const userId = req.user._id;

    if (recipientId === userId.toString()) {
      return errorResponse(res, 'Cannot start conversation with yourself', 400);
    }

    const recipient = await User.findById(recipientId);
    if (!recipient) {
      return errorResponse(res, 'Recipient user not found', 404);
    }

    let conversation = await Conversation.findOne({
      type: 'private',
      participants: { $all: [userId, recipientId], $size: 2 },
    })
      .populate('participants', 'name avatar college course')
      .populate('lastMessage');

    if (!conversation) {
      conversation = await Conversation.create({
        type: 'private',
        participants: [userId, recipientId],
        unreadCounts: new Map(),
      });
      conversation = await Conversation.findById(conversation._id).populate(
        'participants',
        'name avatar college course'
      );
    }

    return successResponse(res, { conversation }, 'Conversation ready');
  } catch (err) {
    next(err);
  }
};

export const getMessages = async (req, res, next) => {
  try {
    const { conversationId } = req.params;
    const userId = req.user._id;

    const conversation = await Conversation.findById(conversationId);
    if (!conversation) {
      return errorResponse(res, 'Conversation not found', 404);
    }

    // Security check: user must be a participant
    const isParticipant = conversation.participants.some(
      (p) => p.toString() === userId.toString()
    );
    if (!isParticipant && req.user.role !== 'admin') {
      return errorResponse(res, 'Access denied. You are not a member of this conversation.', 403);
    }

    const page = parseInt(req.query.page || '1', 10);
    const limit = parseInt(req.query.limit || '50', 10);
    const skip = (page - 1) * limit;

    const messages = await Message.find({ conversation: conversationId })
      .populate('sender', 'name avatar')
      .sort({ createdAt: 1 })
      .skip(skip)
      .limit(limit);

    // Reset user's unread count for this conversation
    if (conversation.unreadCounts) {
      conversation.unreadCounts.set(userId.toString(), 0);
      await conversation.save();
    }

    return successResponse(res, { messages, conversation }, 'Messages retrieved');
  } catch (err) {
    next(err);
  }
};

export const sendMessage = async (req, res, next) => {
  try {
    const { conversationId } = req.params;
    const { content, attachments } = req.body;
    const userId = req.user._id;

    const conversation = await Conversation.findById(conversationId);
    if (!conversation) {
      return errorResponse(res, 'Conversation not found', 404);
    }

    // Security check
    const isParticipant = conversation.participants.some(
      (p) => p.toString() === userId.toString()
    );
    if (!isParticipant && req.user.role !== 'admin') {
      return errorResponse(res, 'Access denied. You cannot send messages to this conversation.', 403);
    }

    const message = await Message.create({
      conversation: conversationId,
      sender: userId,
      content,
      attachments: attachments || [],
      readBy: [userId],
    });

    // Update conversation metadata and unread counts
    conversation.lastMessage = message._id;
    conversation.lastMessageAt = new Date();

    if (!conversation.unreadCounts) {
      conversation.unreadCounts = new Map();
    }

    for (const participantId of conversation.participants) {
      const pIdStr = participantId.toString();
      if (pIdStr !== userId.toString()) {
        const currentCount = conversation.unreadCounts.get(pIdStr) || 0;
        conversation.unreadCounts.set(pIdStr, currentCount + 1);
      }
    }
    await conversation.save();

    const populatedMessage = await Message.findById(message._id).populate('sender', 'name avatar');

    // Broadcast in real-time via Socket.IO room
    emitToRoom(`conversation:${conversationId}`, 'new_message', {
      message: populatedMessage,
      conversationId,
    });

    // If private chat, also send notification to recipient
    if (conversation.type === 'private') {
      const otherParticipant = conversation.participants.find(
        (p) => p.toString() !== userId.toString()
      );
      if (otherParticipant) {
        await createNotification({
          recipient: otherParticipant,
          sender: userId,
          type: 'message',
          title: `New Message from ${req.user.name}`,
          message: content.length > 80 ? `${content.substring(0, 80)}...` : content,
          link: '/messages',
          data: { conversationId },
        });
      }
    }

    return successResponse(res, { message: populatedMessage }, 'Message sent', 201);
  } catch (err) {
    next(err);
  }
};

export const markAsRead = async (req, res, next) => {
  try {
    const { conversationId } = req.params;
    const userId = req.user._id;

    const conversation = await Conversation.findById(conversationId);
    if (!conversation) {
      return errorResponse(res, 'Conversation not found', 404);
    }

    if (conversation.unreadCounts) {
      conversation.unreadCounts.set(userId.toString(), 0);
      await conversation.save();
    }

    await Message.updateMany(
      { conversation: conversationId, readBy: { $ne: userId } },
      { $addToSet: { readBy: userId } }
    );

    return successResponse(res, {}, 'Conversation marked as read');
  } catch (err) {
    next(err);
  }
};

export const uploadAttachment = async (req, res, next) => {
  try {
    if (!req.file) {
      return errorResponse(res, 'No file uploaded', 400);
    }

    const fileUrl = `/uploads/${req.file.filename}`;
    const attachment = {
      url: fileUrl,
      filename: req.file.originalname,
      fileType: req.file.mimetype,
      size: req.file.size,
    };

    return successResponse(res, { attachment }, 'Attachment uploaded');
  } catch (err) {
    next(err);
  }
};
