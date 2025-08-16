const express = require('express');
const User = require('../models/User');
const auth = require('../middleware/auth');

const router = express.Router();

// @route   GET /api/users/search
// @desc    Search users by username
// @access  Private
router.get('/search', auth, async (req, res) => {
  try {
    const { q, limit = 10 } = req.query;

    if (!q || q.trim().length < 2) {
      return res.status(400).json({ message: 'Search query must be at least 2 characters long' });
    }

    const searchRegex = new RegExp(q.trim(), 'i');
    
    const users = await User.find({
      $and: [
        {
          $or: [
            { username: searchRegex },
            { email: searchRegex }
          ]
        },
        { _id: { $ne: req.user._id } } // Exclude current user
      ]
    })
    .select('username avatar status lastSeen')
    .limit(parseInt(limit))
    .sort({ username: 1 });

    res.json(users);

  } catch (error) {
    console.error('Search users error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/users/:userId
// @desc    Get user profile by ID
// @access  Private
router.get('/:userId', auth, async (req, res) => {
  try {
    const { userId } = req.params;

    // Check if user exists
    const user = await User.findById(userId).select('username avatar status lastSeen createdAt');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json(user);

  } catch (error) {
    console.error('Get user profile error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/users/online
// @desc    Get list of online users
// @access  Private
router.get('/online/list', auth, async (req, res) => {
  try {
    const onlineUsers = await User.find({
      status: 'online',
      _id: { $ne: req.user._id }
    })
    .select('username avatar status lastSeen')
    .sort({ lastSeen: -1 });

    res.json(onlineUsers);

  } catch (error) {
    console.error('Get online users error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   PUT /api/users/status
// @desc    Update user status
// @access  Private
router.put('/status', auth, async (req, res) => {
  try {
    const { status } = req.body;

    if (!['online', 'offline', 'away'].includes(status)) {
      return res.status(400).json({ message: 'Invalid status value' });
    }

    req.user.status = status;
    req.user.lastSeen = new Date();
    await req.user.save();

    res.json({ status: req.user.status, lastSeen: req.user.lastSeen });

  } catch (error) {
    console.error('Update status error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST /api/users/block/:userId
// @desc    Block a user
// @access  Private
router.post('/block/:userId', auth, async (req, res) => {
  try {
    const { userId } = req.params;

    if (userId === req.user._id.toString()) {
      return res.status(400).json({ message: 'Cannot block yourself' });
    }

    const userToBlock = await User.findById(userId);
    if (!userToBlock) {
      return res.status(404).json({ message: 'User not found' });
    }

    await req.user.blockUser(userId);

    res.json({ message: 'User blocked successfully' });

  } catch (error) {
    console.error('Block user error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   DELETE /api/users/block/:userId
// @desc    Unblock a user
// @access  Private
router.delete('/block/:userId', auth, async (req, res) => {
  try {
    const { userId } = req.params;

    const userToUnblock = await User.findById(userId);
    if (!userToUnblock) {
      return res.status(404).json({ message: 'User not found' });
    }

    await req.user.unblockUser(userId);

    res.json({ message: 'User unblocked successfully' });

  } catch (error) {
    console.error('Unblock user error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/users/blocked
// @desc    Get list of blocked users
// @access  Private
router.get('/blocked/list', auth, async (req, res) => {
  try {
    const blockedUsers = await User.find({
      _id: { $in: req.user.blockedUsers }
    })
    .select('username avatar status lastSeen');

    res.json(blockedUsers);

  } catch (error) {
    console.error('Get blocked users error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
