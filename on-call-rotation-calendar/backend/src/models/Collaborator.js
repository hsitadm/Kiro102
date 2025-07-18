const mongoose = require('mongoose');
const { isValidTimeZone } = require('../utils/validation');

const CollaboratorSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'User ID is required']
  },
  firstName: {
    type: String,
    required: [true, 'First name is required'],
    trim: true,
    minlength: [2, 'First name must be at least 2 characters long'],
    maxlength: [50, 'First name cannot exceed 50 characters']
  },
  lastName: {
    type: String,
    required: [true, 'Last name is required'],
    trim: true,
    minlength: [2, 'Last name must be at least 2 characters long'],
    maxlength: [50, 'Last name cannot exceed 50 characters']
  },
  timeZone: {
    type: String,
    required: [true, 'Time zone is required'],
    validate: {
      validator: isValidTimeZone,
      message: 'Please provide a valid time zone'
    }
  },
  location: {
    type: String,
    required: [true, 'Location is required'],
    trim: true,
    enum: ['Americas', 'Europe', 'Asia', 'Africa', 'Oceania'],
    default: 'Americas'
  },
  birthDate: {
    type: Date,
    required: [true, 'Birth date is required']
  },
  adjustedBirthDate: {
    type: Date,
    default: null
  },
  maxHoursPerMonth: {
    type: Number,
    default: 160,
    min: [0, 'Maximum hours per month cannot be negative'],
    max: [200, 'Maximum hours per month cannot exceed 200']
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

// Virtual for full name
CollaboratorSchema.virtual('fullName').get(function() {
  return `${this.firstName} ${this.lastName}`;
});

// Method to check if collaborator is available on a specific date
CollaboratorSchema.methods.isAvailableOn = async function(date) {
  const Availability = mongoose.model('Availability');
  const availability = await Availability.findOne({
    collaboratorId: this._id,
    startDate: { $lte: date },
    endDate: { $gte: date },
    status: { $ne: 'AVAILABLE' }
  });
  
  return !availability;
};

// Method to check if date is collaborator's birthday
CollaboratorSchema.methods.isBirthday = function(date) {
  const birthDate = this.adjustedBirthDate || this.birthDate;
  return date.getDate() === birthDate.getDate() && 
         date.getMonth() === birthDate.getMonth();
};

const Collaborator = mongoose.model('Collaborator', CollaboratorSchema);

module.exports = Collaborator;