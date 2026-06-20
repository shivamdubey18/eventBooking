require('dotenv').config();
const mongoose = require('mongoose');
const Event = require('./models/Event');
const Seat = require('./models/Seat');
const Reservation = require('./models/Reservation');

const DB = process.env.MONGODB_URI || 'mongodb://localhost:27017/ticket-booking';

async function run() {
  await mongoose.connect(DB);

  await Promise.all([Event.deleteMany(), Seat.deleteMany(), Reservation.deleteMany()]);

  const events = await Event.insertMany([
    { name: 'Rock Night Live', dateTime: new Date('2025-09-15T20:00:00Z'), venue: 'Madison Square Garden, NYC', totalSeats: 20 },
    { name: 'Jazz Under the Stars', dateTime: new Date('2025-10-05T19:30:00Z'), venue: 'Hollywood Bowl, LA', totalSeats: 15 },
    { name: 'Comedy Spectacular', dateTime: new Date('2025-11-20T21:00:00Z'), venue: 'Royal Albert Hall, London', totalSeats: 10 },
  ]);

  const seats = events.flatMap(ev =>
    Array.from({ length: ev.totalSeats }, (_, i) => {
      const row = String.fromCharCode(65 + Math.floor(i / 5));
      const col = (i % 5) + 1;
      return { eventId: ev._id, seatNumber: `${row}${col}`, status: 'available' };
    })
  );

  await Seat.insertMany(seats);

  console.log(`Seeded ${events.length} events, ${seats.length} seats`);
  events.forEach(ev => console.log(` ${ev.name}: ${ev._id}`));

  await mongoose.disconnect();
}

run().catch(err => { console.error(err); process.exit(1); });
