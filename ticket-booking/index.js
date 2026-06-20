require('dotenv').config();
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');

const app = express();
const PORT = process.env.PORT || 3000;
const DB = process.env.MONGODB_URI || 'mongodb://localhost:27017/ticket-booking';

app.use(express.json());

// Enable CORS for the frontend origin (adjust via CLIENT_ORIGIN env var)
app.use(cors({ origin: process.env.CLIENT_ORIGIN || 'http://localhost:3000', credentials: true }));
app.options('*', cors());

app.use('/api/events', require('./routes/events'));
app.use('/api/reserve', require('./routes/reservations'));
app.use('/api/bookings', require('./routes/bookings'));

app.get('/health', (req, res) => res.json({ ok: true }));

app.use((req, res) => res.status(404).json({ error: 'Not found' }));

app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ error: 'Something went wrong' });
});

mongoose.connect(DB).then(() => {
  app.listen(PORT, () => console.log(`Listening on ${PORT}`));
}).catch(err => {
  console.error('DB connection failed:', err.message);
  process.exit(1);
});

module.exports = app;
