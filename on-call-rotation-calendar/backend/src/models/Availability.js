const mongoose = require('mongoose');

const AvailabilitySchema = new mongoose.Schema({
  collaboratorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Collaborator',
    required: [true, 'Collaborator ID is required']
  },
  startDate: {
    type: Date,
    required: [true, 'Start date is required']
  },
  endDate: {
    type: Date,
    required: [true, 'End date is required']
  },
  status: {
    type: String,
    enum: ['AVAILABLE', 'VACATION', 'SICK_LEAVE', 'TRAINING', 'OTHER'],
    default: 'AVAILABLE'
  },
  notes: {
    type: String,
    trim: true,
    maxlength: [500, 'Notes cannot exceed 500 characters']
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

// Validate that endDate is after startDate
AvailabilitySchema.pre('validate', function(next) {
  if (this.startDate && this.endDate && this.startDate > this.endDate) {
    this.invalidate('endDate', 'End date must be after start date');
  }
  next();
});

// Index for efficient querying of availability by date range
AvailabilitySchema.index({ collaboratorId: 1, startDate: 1, endDate: 1 });

const Availability = mongoose.model('Availability', AvailabilitySchema);

module.exports = Availability;