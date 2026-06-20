import { useEffect, useState } from 'react';
import { getEvents } from '../api';

export default function EventList({ onSelect }) {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    getEvents()
      .then(setEvents)
      .catch(err => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="state-msg">Loading events…</div>;
  if (error) return <div className="state-msg error">Couldn't load events: {error}</div>;
  if (!events.length) return <div className="state-msg">No events available right now.</div>;

  return (
    <div className="event-list">
      <h2 className="section-title">Upcoming events</h2>
      <div className="event-grid">
        {events.map(ev => {
          const date = new Date(ev.dateTime);
          const sold = ev.availableSeats === 0;
          return (
            <button
              key={ev._id}
              className={`event-card ${sold ? 'sold-out' : ''}`}
              onClick={() => !sold && onSelect(ev._id)}
              disabled={sold}
            >
              <div className="event-card-date">
                <span className="event-day">{date.toLocaleDateString('en-US', { day: '2-digit' })}</span>
                <span className="event-month">{date.toLocaleDateString('en-US', { month: 'short' }).toUpperCase()}</span>
              </div>
              <div className="event-card-body">
                <div className="event-name">{ev.name}</div>
                <div className="event-venue">{ev.venue}</div>
                <div className="event-time">{date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}</div>
              </div>
              <div className={`event-seats ${ev.availableSeats <= 3 ? 'low' : ''} ${sold ? 'none' : ''}`}>
                {sold ? 'Sold out' : `${ev.availableSeats} left`}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
