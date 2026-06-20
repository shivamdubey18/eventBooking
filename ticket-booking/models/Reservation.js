const mongoose = require('mongoose');

const reservationSchema = new mongoose.Schema({
  userId: {
    type: String,
    required: true,
  },
  eventId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Event',
    required: true,
  },
  seatNumbers: {
    type: [String],
    required: true,
    validate: {
      validator: (arr) => arr.length > 0,
      message: 'At least one seat must be reserved.',
    },
  },
  expiresAt: {
    type: Date,
    required: true,
  },
}, { timestamps: true });

// TTL index: MongoDB auto-deletes expired reservation docs
reservationSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

module.exports = mongoose.model('Reservation', reservationSchema);
