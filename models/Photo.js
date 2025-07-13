const mongoose = require('mongoose');

const photoSchema = new mongoose.Schema({
  hash: {
    type: String,
    required: true,
    unique: true,
    maxlength: 64,
    index: true
  },
  instagram_photo_url: {
    type: String,
    required: true,
    maxlength: 255
  },
  upload_status: {
    type: String,
    maxlength: 20,
    default: 'pending',
    enum: ['pending', 'processing', 'completed', 'failed']
  },
  token_id: {
    type: String,
    maxlength: 255
  },
  likes: {
    type: Number,
    default: 0
  },
  blockchain_account_address: {
    type: String,
    required: true,
    ref: 'User',
    match: /^0x[a-fA-F0-9]{40}$/
  },
  created_at: {
    type: Date,
    default: Date.now
  },
  updated_at: {
    type: Date,
    default: Date.now
  }
});

photoSchema.index({ hash: 1, blockchain_account_address: 1 });

module.exports = mongoose.model('Photo', photoSchema);
