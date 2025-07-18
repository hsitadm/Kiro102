const mongoose = require('mongoose');

const ScheduleProposalSchema = new mongoose.Schema({
  scheduleId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Schedule',
    required: [true, 'Schedule ID is required']
  },
  proposalNumber: {
    type: Number,
    required: [true, 'Proposal number is required'],
    min: [1, 'Proposal number must be at least 1']
  },
  status: {
    type: String,
    enum: ['PENDING', 'ACCEPTED', 'REJECTED'],
    default: 'PENDING'
  },
  managerFeedback: {
    type: String,
    trim: true,
    maxlength: [1000, 'Manager feedback cannot exceed 1000 characters']
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
ScheduleProposalSchema.index({ scheduleId: 1, proposalNumber: 1 }, { unique: true });

// Static method to get the next proposal number for a schedule
ScheduleProposalSchema.statics.getNextProposalNumber = async function(scheduleId) {
  const latestProposal = await this.findOne({ scheduleId })
    .sort({ proposalNumber: -1 });
  
  return latestProposal ? latestProposal.proposalNumber + 1 : 1;
};

// Method to get all entries for this proposal
ScheduleProposalSchema.methods.getEntries = async function() {
  const ProposalEntry = mongoose.model('ProposalEntry');
  return await ProposalEntry.find({ proposalId: this._id })
    .populate('collaboratorId')
    .populate('shiftId')
    .sort({ date: 1 });
};

const ScheduleProposal = mongoose.model('ScheduleProposal', ScheduleProposalSchema);

module.exports = ScheduleProposal;