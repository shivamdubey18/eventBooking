const express = require('express');
const mongoose = require('mongoose');
const Event = require('../models/Event');
const Seat = require('../models/Seat');
const Reservation = require('../models/Reservation');

const router = express.Router();
const HOLD_DURATION = 10 * 60 * 1000;

router.post('/', async (req, res) => {
  const { userId, eventId, seatNumbers } = req.body;

  if (!userId || !eventId || !Array.isArray(seatNumbers) || !seatNumbers.length)
    return res.status(400).json({ error: 'userId, eventId and seatNumbers are required' });

  if (!mongoose.Types.ObjectId.isValid(eventId))
    return res.status(400).json({ error: 'Invalid eventId' });

  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const event = await Event.findById(eventId).session(session);
    if (!event) {
      await session.abortTransaction();
      return res.status(404).json({ error: 'Event not found' });
    }

    const updated = await Seat.updateMany(
      { eventId, seatNumber: { $in: seatNumbers }, status: 'available' },
      { $set: { status: 'reserved' } },
      { session }
    );

    if (updated.modifiedCount !== seatNumbers.length) {
      await session.abortTransaction();

      const taken = await Seat.find({
        eventId,
        seatNumber: { $in: seatNumbers },
        status: { $ne: 'available' },
      }).select('seatNumber status -_id');

      return res.status(409).json({ error: 'Some seats are unavailable', taken });
    }

    const expiresAt = new Date(Date.now() + HOLD_DURATION);
    const [reservation] = await Reservation.create(
      [{ userId, eventId, seatNumbers, expiresAt }],
      { session }
    );

    await session.commitTransaction();

    res.status(201).json({
      reservationId: reservation._id,
      seatNumbers,
      expiresAt,
    });
  } catch (err) {
    await session.abortTransaction();
    res.status(500).json({ error: err.message });
  } finally {
    session.endSession();
  }
});

module.exports = router;
