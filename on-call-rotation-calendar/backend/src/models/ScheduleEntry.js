const mongoose = require('mongoose');

const ScheduleEntrySchema = new mongoose.Schema({
  scheduleId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Schedule',
    required: [true, 'Schedule ID is required']
  },
  collaboratorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Collaborator',
    required: [true, 'Collaborator ID is required']
  },
  shiftId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Shift',
    required: [true, 'Shift ID is required']
  },
  date: {
    type: Date,
    required: [true, 'Date is required']
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

// Compound index for efficient querying
ScheduleEntrySchema.index({ scheduleId: 1, date: 1, collaboratorId: 1 }, { unique: true });

// Pre-save validation to ensure collaborator is available
ScheduleEntrySchema.pre('save', async function(next) {
  try {
    const Collaborator = mongoose.model('Collaborator');
    const collaborator = await Collaborator.findById(this.collaboratorId);
    
    if (!collaborator) {
      return next(new Error('Collaborator not found'));
    }
    
    const isAvailable = await collaborator.isAvailableOn(this.date);
    if (!isAvailable) {
      return next(new Error('Collaborator is not available on this date'));
    }
    
    // Check if this is a birthday
    if (collaborator.isBirthday(this.date)) {
      return next(new Error('Cannot schedule on collaborator\'s birthday'));
    }
    
    next();
  } catch (error) {
    next(error);
  }
});

// Static method to check for consecutive night shifts
ScheduleEntrySchema.statics.hasConsecutiveNightShifts = async function(collaboratorId, startDate, endDate, maxConsecutive = 5) {
  const Shift = mongoose.model('Shift');
  const nightShifts = await Shift.find({ type: 'NIGHT' });
  const nightShiftIds = nightShifts.map(shift => shift._id);
  
  const entries = await this.find({
    collaboratorId,
    date: { $gte: startDate, $lte: endDate },
    shiftId: { $in: nightShiftIds }
  }).sort({ date: 1 });
  
  let consecutiveCount = 0;
  let maxConsecutiveCount = 0;
  
  for (let i = 0; i < entries.length; i++) {
    if (i === 0) {
      consecutiveCount = 1;
    } else {
      const prevDate = new Date(entries[i-1].date);
      const currDate = new Date(entries[i].date);
      
      // Check if dates are consecutive
      const diffTime = Math.abs(currDate - prevDate);
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      
      if (diffDays === 1) {
        consecutiveCount++;
      } else {
        consecutiveCount = 1;
      }
    }
    
    maxConsecutiveCount = Math.max(maxConsecutiveCount, consecutiveCount);
  }
  
  return maxConsecutiveCount > maxConsecutive;
};

const ScheduleEntry = mongoose.model('ScheduleEntry', ScheduleEntrySchema);

module.exports = ScheduleEntry;