const mongoose = require('mongoose');

const IntegrationConfigSchema = new mongoose.Schema({
  type: {
    type: String,
    enum: ['GOOGLE_CALENDAR', 'JIRA'],
    required: [true, 'Integration type is required']
  },
  configData: {
    type: mongoose.Schema.Types.Mixed,
    required: [true, 'Configuration data is required']
  },
  isActive: {
    type: Boolean,
    default: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Validate configuration data based on integration type
IntegrationConfigSchema.pre('validate', function(next) {
  if (this.type === 'GOOGLE_CALENDAR') {
    // Validate Google Calendar config
    const requiredFields = ['clientId', 'clientSecret', 'redirectUri', 'calendarId'];
    for (const field of requiredFields) {
      if (!this.configData[field]) {
        this.invalidate('configData', `${field} is required for Google Calendar integration`);
      }
    }
  } else if (this.type === 'JIRA') {
    // Validate Jira config
    const requiredFields = ['baseUrl', 'username', 'apiToken', 'projectKey'];
    for (const field of requiredFields) {
      if (!this.configData[field]) {
        this.invalidate('configData', `${field} is required for Jira integration`);
      }
    }
  }
  
  next();
});

// Static method to get active configuration for a specific integration type
IntegrationConfigSchema.statics.getActiveConfig = async function(type) {
  return await this.findOne({ type, isActive: true });
};

const IntegrationConfig = mongoose.model('IntegrationConfig', IntegrationConfigSchema);

module.exports = IntegrationConfig;