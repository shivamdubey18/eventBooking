const express = require('express');
const mongoose = require('mongoose');
const Event = require('../models/Event');
const Seat = require('../models/Seat');

const router = express.Router();

router.get('/', async (req, res) => {
  try {
    const events = await Event.find().sort({ dateTime: 1 });

    const result = await Promise.all(events.map(async ev => {
      const availableSeats = await Seat.countDocuments({ eventId: ev._id, status: 'available' });
      return { ...ev.toObject(), availableSeats };
    }));

    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/:id', async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id))
      return res.status(400).json({ error: 'Invalid event ID' });

    const event = await Event.findById(req.params.id);
    if (!event) return res.status(404).json({ error: 'Event not found' });

    const seats = await Seat.find({ eventId: event._id }).sort({ seatNumber: 1 });
    res.json({ ...event.toObject(), seats });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
