import { Server } from 'socket.io';
import mongoose from 'mongoose';
import { verifyToken } from '../utils/jwt.js';
import { User } from '../models/User.js';
import { Conversation } from '../models/Conversation.js';
import { ENV } from '../config/env.js';

let ioInstance = null;
const onlineUsers = new Map(); // userId -> Set of socket IDs

export const initSocket = (server) => {
  ioInstance = new Server(server, {
    cors: {
      origin: [ENV.CLIENT_URL, 'http://localhost:5173', 'http://localhost:3000'],
      credentials: true,
      methods: ['GET', 'POST'],
    },
  });

  // Socket Auth Middleware: verify JWT token from auth object or cookie
  ioInstance.use(async (socket, next) => {
    try {
      let token = socket.handshake.auth?.token;

      // Also check handshake headers cookie
      if (!token && socket.handshake.headers?.cookie) {
        const rawCookies = socket.handshake.headers.cookie.split(';');
        for (const cookie of rawCookies) {
          const [key, val] = cookie.trim().split('=');
          if (key === 'token') {
            token = decodeURIComponent(val);
            break;
          }
        }
      }

      if (!token) {
        return next(new Error('Authentication token required'));
      }

      const decoded = verifyToken(token);
      const user = await User.findById(decoded.id).select('name email role isSuspended');

      if (!user || user.isSuspended) {
        return next(new Error('User unauthorized or suspended'));
      }

      socket.user = user;
      next();
    } catch (err) {
      next(new Error(`Socket authentication error: ${err.message}`));
    }
  });

  ioInstance.on('connection', (socket) => {
    const userId = socket.user._id.toString();

    // Track online user
    if (!onlineUsers.has(userId)) {
      onlineUsers.set(userId, new Set());
    }
    onlineUsers.get(userId).add(socket.id);

    // Join personal user notification room
    socket.join(`user:${userId}`);

    // Broadcast online status to peers
    socket.broadcast.emit('user_status_changed', { userId, status: 'online' });

    // Join conversation / team room with strict membership check
    socket.on('join_conversation', async (conversationId) => {
      try {
        if (!conversationId || !mongoose.isValidObjectId(conversationId)) {
          return socket.emit('conversation_error', { message: 'Invalid conversation ID format' });
        }

        const conversation = await Conversation.findById(conversationId);
        if (!conversation) {
          return socket.emit('conversation_error', { message: 'Conversation not found' });
        }

        const isMember = conversation.participants.some(
          (p) => p.toString() === userId
        );

        if (!isMember && socket.user.role !== 'admin') {
          return socket.emit('conversation_error', {
            message: 'Access denied: You are not authorized to join this conversation',
          });
        }

        socket.join(`conversation:${conversationId}`);
      } catch (err) {
        socket.emit('conversation_error', { message: 'Failed to join conversation room' });
      }
    });

    // Leave conversation room
    socket.on('leave_conversation', (conversationId) => {
      if (conversationId) {
        socket.leave(`conversation:${conversationId}`);
      }
    });

    // Typing indicator — only broadcast if socket is authorized in the room
    socket.on('typing_start', ({ conversationId }) => {
      if (socket.rooms.has(`conversation:${conversationId}`)) {
        socket.to(`conversation:${conversationId}`).emit('user_typing', {
          userId,
          userName: socket.user.name,
          conversationId,
          isTyping: true,
        });
      }
    });

    socket.on('typing_stop', ({ conversationId }) => {
      if (socket.rooms.has(`conversation:${conversationId}`)) {
        socket.to(`conversation:${conversationId}`).emit('user_typing', {
          userId,
          userName: socket.user.name,
          conversationId,
          isTyping: false,
        });
      }
    });

    // Disconnect handler
    socket.on('disconnect', () => {
      const userSockets = onlineUsers.get(userId);
      if (userSockets) {
        userSockets.delete(socket.id);
        if (userSockets.size === 0) {
          onlineUsers.delete(userId);
          socket.broadcast.emit('user_status_changed', { userId, status: 'offline' });
        }
      }
    });
  });

  return ioInstance;
};

export const getIO = () => {
  return ioInstance;
};

export const isUserOnline = (userId) => {
  return onlineUsers.has(userId.toString());
};

export const emitToUser = (userId, event, data) => {
  if (ioInstance) {
    ioInstance.to(`user:${userId.toString()}`).emit(event, data);
  }
};

export const emitToRoom = (roomName, event, data) => {
  if (ioInstance) {
    ioInstance.to(roomName).emit(event, data);
  }
};
