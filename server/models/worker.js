const mongoose = require('mongoose');

const workerSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Name is required'],
    trim: true,
    minlength: [2, 'Name must be at least 2 characters long']
  },
  phone: {
    type: String,
    required: [true, 'Phone number is required'],
    match: [/^\+?[\d\s-]{10,}$/, 'Please enter a valid phone number'],
    unique: true
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    match: [/^[\w-]+(\.[\w-]+)*@([\w-]+\.)+[a-zA-Z]{2,7}$/, 'Please enter a valid email address'],
    unique: true,
    lowercase: true,
    trim: true
  },
  age: {
    type: Number,
    min: [18, 'Must be at least 18 years old'],
    max: [100, 'Age cannot exceed 100']
  },
  originState: {
    type: String,
    trim: true
  },
  skill: {
    type: String,
    trim: true
  },
  aadhaar: {
    type: String,
    match: [/^\d{12}$/, 'Aadhaar number must be exactly 12 digits'],
    sparse: true
  },
  photoUrl: {
    type: String,
    trim: true
  },
  location: {
    latitude: Number,
    longitude: Number
  },
  status: {
    type: String,
    enum: {
      values: ['pending', 'approved', 'rejected'],
      message: '{VALUE} is not a valid status'
    },
    default: 'pending'
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

// Update the updatedAt timestamp before saving
workerSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

// Create indexes for frequently queried fields
workerSchema.index({ phone: 1 });
workerSchema.index({ email: 1 });
workerSchema.index({ status: 1 });
workerSchema.index({ createdAt: -1 });

const Worker = mongoose.model('Worker', workerSchema);

module.exports = { Worker }; 