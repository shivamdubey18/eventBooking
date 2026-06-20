const express = require('express');
const mongoose = require('mongoose');
const Seat = require('../models/Seat');
const Reservation = require('../models/Reservation');

const router = express.Router();

router.post('/', async (req, res) => {
  const { reservationId, userId } = req.body;

  if (!reservationId || !userId)
    return res.status(400).json({ error: 'reservationId and userId are required' });

  if (!mongoose.Types.ObjectId.isValid(reservationId))
    return res.status(400).json({ error: 'Invalid reservationId' });

  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const reservation = await Reservation.findOne({ _id: reservationId, userId }).session(session);

    if (!reservation) {
      await session.abortTransaction();
      return res.status(404).json({ error: 'Reservation not found' });
    }

    if (reservation.expiresAt < new Date()) {
      await Seat.updateMany(
        { eventId: reservation.eventId, seatNumber: { $in: reservation.seatNumbers }, status: 'reserved' },
        { $set: { status: 'available' } },
        { session }
      );
      await Reservation.deleteOne({ _id: reservationId }).session(session);
      await session.commitTransaction();
      return res.status(410).json({ error: 'Reservation expired, seats released' });
    }

    const updated = await Seat.updateMany(
      { eventId: reservation.eventId, seatNumber: { $in: reservation.seatNumbers }, status: 'reserved' },
      { $set: { status: 'booked' } },
      { session }
    );

    if (updated.modifiedCount !== reservation.seatNumbers.length) {
      await session.abortTransaction();
      return res.status(409).json({ error: 'Seat status conflict, please re-reserve' });
    }

    await Reservation.deleteOne({ _id: reservationId }).session(session);
    await session.commitTransaction();

    res.status(201).json({
      bookingRef: `BKG-${reservationId.toString().slice(-8).toUpperCase()}`,
      eventId: reservation.eventId,
      seatNumbers: reservation.seatNumbers,
      bookedAt: new Date(),
    });
  } catch (err) {
    await session.abortTransaction();
    res.status(500).json({ error: err.message });
  } finally {
    session.endSession();
  }
});

module.exports = router;
