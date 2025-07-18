const mongoose = require('mongoose');

const WorkHourStatisticsSchema = new mongoose.Schema({
  collaboratorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Collaborator',
    required: [true, 'Collaborator ID is required']
  },
  month: {
    type: Number,
    required: [true, 'Month is required'],
    min: [1, 'Month must be between 1 and 12'],
    max: [12, 'Month must be between 1 and 12']
  },
  year: {
    type: Number,
    required: [true, 'Year is required'],
    min: [2000, 'Year must be 2000 or later']
  },
  totalHours: {
    type: Number,
    required: [true, 'Total hours is required'],
    min: [0, 'Total hours cannot be negative']
  },
  morningShiftHours: {
    type: Number,
    default: 0,
    min: [0, 'Morning shift hours cannot be negative']
  },
  afternoonShiftHours: {
    type: Number,
    default: 0,
    min: [0, 'Afternoon shift hours cannot be negative']
  },
  nightShiftHours: {
    type: Number,
    default: 0,
    min: [0, 'Night shift hours cannot be negative']
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
WorkHourStatisticsSchema.index({ collaboratorId: 1, year: 1, month: 1 }, { unique: true });

// Static method to calculate statistics for a specific month and year
WorkHourStatisticsSchema.statics.calculateForMonth = async function(month, year) {
  const ScheduleEntry = mongoose.model('ScheduleEntry');
  const Collaborator = mongoose.model('Collaborator');
  const Shift = mongoose.model('Shift');
  
  // Get all collaborators
  const collaborators = await Collaborator.find();
  
  // Calculate start and end dates for the month
  const startDate = new Date(year, month - 1, 1);
  const endDate = new Date(year, month, 0); // Last day of month
  
  const results = [];
  
  for (const collaborator of collaborators) {
    // Get all entries for this collaborator in the specified month
    const entries = await ScheduleEntry.find({
      collaboratorId: collaborator._id,
      date: { $gte: startDate, $lte: endDate }
    }).populate('shiftId');
    
    // Calculate statistics
    let totalHours = 0;
    let morningShiftHours = 0;
    let afternoonShiftHours = 0;
    let nightShiftHours = 0;
    
    for (const entry of entries) {
      const hours = entry.shiftId.durationHours;
      totalHours += hours;
      
      switch (entry.shiftId.type) {
        case 'MORNING':
          morningShiftHours += hours;
          break;
        case 'AFTERNOON':
          afternoonShiftHours += hours;
          break;
        case 'NIGHT':
          nightShiftHours += hours;
          break;
      }
    }
    
    // Create or update statistics record
    const stats = await this.findOneAndUpdate(
      { collaboratorId: collaborator._id, month, year },
      {
        totalHours,
        morningShiftHours,
        afternoonShiftHours,
        nightShiftHours
      },
      { new: true, upsert: true }
    );
    
    results.push(stats);
  }
  
  return results;
};

const WorkHourStatistics = mongoose.model('WorkHourStatistics', WorkHourStatisticsSchema);

module.exports = WorkHourStatistics;