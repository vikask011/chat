const express = require('express');
const { body, validationResult } = require('express-validator');
const Message = require('../models/Message');
const User = require('../models/User');
const auth = require('../middleware/auth');

const router = express.Router();

// @route   POST /api/messages
// @desc    Send a new message
// @access  Private
router.post('/', auth, [
  body('recipientId')
    .isMongoId()
    .withMessage('Invalid recipient ID'),
  body('content')
    .trim()
    .isLength({ min: 1, max: 1000 })
    .withMessage('Message content must be between 1 and 1000 characters')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { recipientId, content, messageType = 'text' } = req.body;

    // Check if recipient exists
    const recipient = await User.findById(recipientId);
    if (!recipient) {
      return res.status(404).json({ message: 'Recipient not found' });
    }

    // Check if recipient is not the sender
    if (recipientId === req.user._id.toString()) {
      return res.status(400).json({ message: 'Cannot send message to yourself' });
    }

    // Check if either user has blocked the other
    if (req.user.isUserBlocked(recipientId) || recipient.isUserBlocked(req.user._id)) {
      return res.status(403).json({ message: 'Cannot send message to this user' });
    }

    // Create new message
    const message = new Message({
      sender: req.user._id,
      recipient: recipientId,
      content,
      messageType
    });

    await message.save();

    // Populate sender and recipient details
    await message.populate([
      { path: 'sender', select: 'username avatar' },
      { path: 'recipient', select: 'username avatar' }
    ]);

    res.status(201).json(message);

  } catch (error) {
    console.error('Send message error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/messages/conversation/:userId
// @desc    Get conversation between current user and another user
// @access  Private
router.get('/conversation/:userId', auth, async (req, res) => {
  try {
    const { userId } = req.params;
    const { page = 1, limit = 50 } = req.query;

    // Check if the other user exists
    const otherUser = await User.findById(userId);
    if (!otherUser) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Check if either user has blocked the other
    if (req.user.isUserBlocked(userId) || otherUser.isUserBlocked(req.user._id)) {
      return res.status(403).json({ message: 'Cannot access conversation with this user' });
    }

    // Get messages between the two users
    const messages = await Message.find({
      $or: [
        { sender: req.user._id, recipient: userId },
        { sender: userId, recipient: req.user._id }
      ]
    })
    .sort({ createdAt: -1 })
    .limit(limit * 1)
    .skip((page - 1) * limit)
    .populate('sender', 'username avatar')
    .populate('recipient', 'username avatar');

    // Mark messages as read if they were sent to current user
    await Message.updateMany(
      {
        sender: userId,
        recipient: req.user._id,
        read: false
      },
      {
        read: true,
        readAt: new Date()
      }
    );

    // Get total count for pagination
    const total = await Message.countDocuments({
      $or: [
        { sender: req.user._id, recipient: userId },
        { sender: userId, recipient: req.user._id }
      ]
    });

    res.json({
      messages: messages.reverse(), // Reverse to get chronological order
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(total / limit),
        totalMessages: total,
        hasNextPage: page * limit < total,
        hasPrevPage: page > 1
      }
    });

  } catch (error) {
    console.error('Get conversation error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/messages/recent
// @desc    Get recent conversations for current user
// @access  Private
router.get('/recent', auth, async (req, res) => {
  try {
    // Get the most recent message from each conversation
    const recentMessages = await Message.aggregate([
      {
        $match: {
          $or: [
            { sender: req.user._id },
            { recipient: req.user._id }
          ]
        }
      },
      {
        $addFields: {
          otherUser: {
            $cond: [
              { $eq: ['$sender', req.user._id] },
              '$recipient',
              '$sender'
            ]
          }
        }
      },
      {
        $match: {
          otherUser: { $nin: req.user.blockedUsers }
        }
      },
      {
        $sort: { createdAt: -1 }
      },
      {
        $group: {
          _id: '$otherUser',
          lastMessage: { $first: '$$ROOT' },
          unreadCount: {
            $sum: {
              $cond: [
                {
                  $and: [
                    { $eq: ['$recipient', req.user._id] },
                    { $eq: ['$read', false] }
                  ]
                },
                1,
                0
              ]
            }
          }
        }
      },
      {
        $sort: { 'lastMessage.createdAt': -1 }
      }
    ]);

    // Populate user details for each conversation
    const conversations = await Promise.all(
      recentMessages.map(async (conv) => {
        const user = await User.findById(conv._id).select('username avatar status lastSeen');
        return {
          user,
          lastMessage: conv.lastMessage,
          unreadCount: conv.unreadCount
        };
      })
    );

    res.json(conversations);

  } catch (error) {
    console.error('Get recent conversations error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   PUT /api/messages/:messageId/read
// @desc    Mark a message as read
// @access  Private
router.put('/:messageId/read', auth, async (req, res) => {
  try {
    const { messageId } = req.params;

    const message = await Message.findById(messageId);
    if (!message) {
      return res.status(404).json({ message: 'Message not found' });
    }

    // Check if the current user is the recipient
    if (message.recipient.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to mark this message as read' });
    }

    message.read = true;
    message.readAt = new Date();
    await message.save();

    res.json(message);

  } catch (error) {
    console.error('Mark message as read error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   DELETE /api/messages/:messageId
// @desc    Delete a message (only sender can delete)
// @access  Private
router.delete('/:messageId', auth, async (req, res) => {
  try {
    const { messageId } = req.params;

    const message = await Message.findById(messageId);
    if (!message) {
      return res.status(404).json({ message: 'Message not found' });
    }

    // Check if the current user is the sender
    if (message.sender.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to delete this message' });
    }

    await Message.findByIdAndDelete(messageId);

    res.json({ message: 'Message deleted successfully' });

  } catch (error) {
    console.error('Delete message error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
