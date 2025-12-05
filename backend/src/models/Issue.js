const mongoose = require('mongoose');

const issueSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  issueNumber: { type: Number, required: true },
  title: { type: String, required: true },
  body: String,
  state: { type: String, default: 'open' },
  repoOwner: { type: String, required: true },
  repoName: { type: String, required: true },
  htmlUrl: String,
  createdBy: String
}, { timestamps: true });

issueSchema.index({ userId: 1, repoOwner: 1, repoName: 1, issueNumber: 1 }, { unique: true });

module.exports = mongoose.model('Issue', issueSchema);
