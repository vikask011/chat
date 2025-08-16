const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    minlength: 3,
    maxlength: 20
  },
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true
  },
  password: {
    type: String,
    required: true,
    minlength: 6
  },
  avatar: {
    type: String,
    default: ''
  },
  status: {
    type: String,
    enum: ['online', 'offline', 'away'],
    default: 'offline'
  },
  lastSeen: {
    type: Date,
    default: Date.now
  },
  blockedUsers: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }]
}, {
  timestamps: true
});

// Hash password before saving
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Method to compare password
userSchema.methods.comparePassword = async function(candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

// Method to get public profile (without password)
userSchema.methods.getPublicProfile = function() {
  const userObject = this.toObject();
  delete userObject.password;
  return userObject;
};

// Method to block a user
userSchema.methods.blockUser = async function(userIdToBlock) {
  if (!this.blockedUsers.includes(userIdToBlock)) {
    this.blockedUsers.push(userIdToBlock);
    await this.save();
  }
  return this;
};

// Method to unblock a user
userSchema.methods.unblockUser = async function(userIdToUnblock) {
  this.blockedUsers = this.blockedUsers.filter(id => id.toString() !== userIdToUnblock.toString());
  await this.save();
  return this;
};

// Method to check if a user is blocked
userSchema.methods.isUserBlocked = function(userId) {
  return this.blockedUsers.some(id => id.toString() === userId.toString());
};

module.exports = mongoose.model('User', userSchema);
