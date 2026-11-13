const mongoose = require('mongoose');
const { isValidDateOnly } = require('../utils/date');

const complaintSchema = new mongoose.Schema({
  block:           { type: mongoose.Schema.Types.ObjectId, ref: 'Block', required: true },
  room:            { type: mongoose.Schema.Types.ObjectId, ref: 'Room',  required: true },
  complaintType:   {
    type: String, required: true,
    enum: ['PC Hardware','PC Software','Application Issues','Network','Electronics','Plumbing','Other']
  },
  remarks:         { type: String, required: true, trim: true },
  dueDate:         {
    type: String,
    default: null,
    validate: {
      validator: (value) => value == null || isValidDateOnly(value),
      message: 'Due date must be a valid calendar date (YYYY-MM-DD)',
    },
  },
  attachment:      { type: String, default: null },
  status:          {
    type: String,
    enum: ['Pending','Assigned','In-Progress','On Hold','Completed'],
    default: 'Pending'
  },
  raisedBy:        { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  assignedTo:      { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
  department:      { type: mongoose.Schema.Types.ObjectId, ref: 'Department', required: true },
  programme:       { type: mongoose.Schema.Types.ObjectId, ref: 'Programme',  required: true },
  statusHistory: [{
    status:    { type: String },
    changedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    changedAt: { type: Date, default: Date.now },
    note:      { type: String }
  }],
  closedAt: { type: Date, default: null },
}, { timestamps: true });

module.exports = mongoose.model('Complaint', complaintSchema);
