const mongoose = require('mongoose');

const ScheduleSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Schedule name is required'],
    trim: true,
    maxlength: [100, 'Schedule name cannot exceed 100 characters']
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
    enum: ['DRAFT', 'PROPOSED', 'APPROVED', 'PUBLISHED'],
    default: 'DRAFT'
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Creator ID is required']
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
ScheduleSchema.pre('validate', function(next) {
  if (this.startDate && this.endDate && this.startDate > this.endDate) {
    this.invalidate('endDate', 'End date must be after start date');
  }
  next();
});

// Method to get all entries for this schedule
ScheduleSchema.methods.getEntries = async function() {
  const ScheduleEntry = mongoose.model('ScheduleEntry');
  return await ScheduleEntry.find({ scheduleId: this._id })
    .populate('collaboratorId')
    .populate('shiftId')
    .sort({ date: 1 });
};

// Method to get work hours statistics for this schedule
ScheduleSchema.methods.getWorkHoursStatistics = async function() {
  const ScheduleEntry = mongoose.model('ScheduleEntry');
  const Shift = mongoose.model('Shift');
  
  const entries = await ScheduleEntry.find({ scheduleId: this._id })
    .populate('collaboratorId')
    .populate('shiftId');
  
  const collaboratorStats = {};
  
  for (const entry of entries) {
    const collaboratorId = entry.collaboratorId._id.toString();
    const shiftType = entry.shiftId.type;
    const hours = entry.shiftId.durationHours;
    
    if (!collaboratorStats[collaboratorId]) {
      collaboratorStats[collaboratorId] = {
        collaborator: entry.collaboratorId,
        totalHours: 0,
        morningShiftHours: 0,
        afternoonShiftHours: 0,
        nightShiftHours: 0,
        shiftCounts: {
          MORNING: 0,
          AFTERNOON: 0,
          NIGHT: 0
        }
      };
    }
    
    collaboratorStats[collaboratorId].totalHours += hours;
    collaboratorStats[collaboratorId].shiftCounts[shiftType]++;
    
    switch (shiftType) {
      case 'MORNING':
        collaboratorStats[collaboratorId].morningShiftHours += hours;
        break;
      case 'AFTERNOON':
        collaboratorStats[collaboratorId].afternoonShiftHours += hours;
        break;
      case 'NIGHT':
        collaboratorStats[collaboratorId].nightShiftHours += hours;
        break;
    }
  }
  
  return Object.values(collaboratorStats);
};

const Schedule = mongoose.model('Schedule', ScheduleSchema);

module.exports = Schedule;