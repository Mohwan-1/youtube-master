const mongoose = require('mongoose');

const apiKeySchema = new mongoose.Schema({
  userId: {
    type: String,
    required: true,
    unique: true
  },
  geminiApiKey: {
    type: String,
    required: false,
    default: ''
  },
  youtubeApiKey: {
    type: String,
    required: false,
    default: ''
  },
  googleClientId: {
    type: String,
    required: false,
    default: ''
  },
  googleClientSecret: {
    type: String,
    required: false,
    default: ''
  },
  isConfigured: {
    type: Boolean,
    default: false
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Update timestamp on save
apiKeySchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

module.exports = mongoose.model('ApiKey', apiKeySchema);
