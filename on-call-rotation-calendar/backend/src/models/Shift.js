const mongoose = require('mongoose');

const ShiftSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Shift name is required'],
    trim: true,
    maxlength: [50, 'Shift name cannot exceed 50 characters']
  },
  startTime: {
    type: String,
    required: [true, 'Start time is required'],
    validate: {
      validator: function(v) {
        // Validate time format (HH:MM)
        return /^([01]\d|2[0-3]):([0-5]\d)$/.test(v);
      },
      message: props => `${props.value} is not a valid time format. Use HH:MM (24-hour format)`
    }
  },
  endTime: {
    type: String,
    required: [true, 'End time is required'],
    validate: {
      validator: function(v) {
        // Validate time format (HH:MM)
        return /^([01]\d|2[0-3]):([0-5]\d)$/.test(v);
      },
      message: props => `${props.value} is not a valid time format. Use HH:MM (24-hour format)`
    }
  },
  type: {
    type: String,
    enum: ['MORNING', 'AFTERNOON', 'NIGHT'],
    required: [true, 'Shift type is required']
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

// Virtual for shift duration in hours
ShiftSchema.virtual('durationHours').get(function() {
  const startParts = this.startTime.split(':').map(Number);
  const endParts = this.endTime.split(':').map(Number);
  
  let startMinutes = startParts[0] * 60 + startParts[1];
  let endMinutes = endParts[0] * 60 + endParts[1];
  
  // Handle overnight shifts
  if (endMinutes < startMinutes) {
    endMinutes += 24 * 60; // Add 24 hours
  }
  
  return (endMinutes - startMinutes) / 60;
});

// Static method to get predefined shifts based on requirements
ShiftSchema.statics.getPredefinedShifts = function() {
  return [
    {
      name: 'Morning Shift',
      startTime: '07:00',
      endTime: '15:00',
      type: 'MORNING'
    },
    {
      name: 'Afternoon Shift',
      startTime: '15:00',
      endTime: '23:00',
      type: 'AFTERNOON'
    },
    {
      name: 'Night Shift',
      startTime: '23:00',
      endTime: '07:00',
      type: 'NIGHT'
    }
  ];
};

const Shift = mongoose.model('Shift', ShiftSchema);

module.exports = Shift;