import { Notification } from '../models/Notification.js';
import { emitToUser } from './socketService.js';

export const createNotification = async ({
  recipient,
  sender = null,
  type,
  title,
  message,
  link = '',
  data = {},
}) => {
  try {
    const notification = await Notification.create({
      recipient,
      sender,
      type,
      title,
      message,
      link,
      data,
    });

    // Populate sender details for real-time delivery
    const populated = await notification.populate('sender', 'name avatar');

    // Emit live to user room if online
    emitToUser(recipient, 'new_notification', populated);

    return populated;
  } catch (err) {
    console.error('Error creating notification:', err);
    return null;
  }
};
