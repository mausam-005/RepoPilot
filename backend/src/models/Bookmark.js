const mongoose = require('mongoose');

const bookmarkSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  repoId: { type: Number, required: true },
  repoName: { type: String, required: true },
  repoFullName: { type: String, required: true },
  repoUrl: { type: String, required: true },
  description: String,
  language: String,
  stars: Number
}, { timestamps: true });

bookmarkSchema.index({ userId: 1, repoId: 1 }, { unique: true });

module.exports = mongoose.model('Bookmark', bookmarkSchema);
