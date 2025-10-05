import mongoose from 'mongoose';

const activitySchema = new mongoose.Schema({
  ticket: { type: mongoose.Schema.Types.ObjectId, ref: 'Ticket', required: true },
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  action: { 
    type: String, 
    enum: ['created', 'updated', 'assigned', 'status_changed', 'commented', 'resolved', 'closed'],
    required: true 
  },
  details: {
    field: String,
    oldValue: mongoose.Schema.Types.Mixed,
    newValue: mongoose.Schema.Types.Mixed,
    message: String
  },
  metadata: {
    ip: String,
    userAgent: String
  }
}, { timestamps: true });

export default mongoose.model('Activity', activitySchema);
