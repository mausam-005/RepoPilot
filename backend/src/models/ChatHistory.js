const mongoose = require('mongoose');

const chatHistorySchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  owner: {
    type: String,
    default: null
  },
  repo: {
    type: String,
    default: null
  },
  isGlobal: {
    type: Boolean,
    default: true
  },
  messages: {
    type: Array,
    default: []
  }
}, { timestamps: true });

// Ensure a user only has one active chat history per repo context
chatHistorySchema.index({ user: 1, owner: 1, repo: 1, isGlobal: 1 }, { unique: true });

module.exports = mongoose.model('ChatHistory', chatHistorySchema);
