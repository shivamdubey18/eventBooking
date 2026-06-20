import { useEffect, useState, useCallback } from 'react';
import { getEvent, reserve, confirmBooking } from '../api';
import { useAuth } from '../context/AuthContext';
import SeatGrid from './SeatGrid';
import CountdownTimer from './CountdownTimer';

const STEPS = { SELECTING: 'selecting', RESERVED: 'reserved', CONFIRMED: 'confirmed' };

export default function BookingFlow({ eventId, onBack }) {
  const { user } = useAuth();
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [step, setStep] = useState(STEPS.SELECTING);

  const [selected, setSelected] = useState([]);
  const [reservation, setReservation] = useState(null);
  const [booking, setBooking] = useState(null);

  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  const fetchEvent = useCallback(async () => {
    try {
      const data = await getEvent(eventId);
      setEvent(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [eventId]);

  useEffect(() => { fetchEvent(); }, [fetchEvent]);

  function toggleSeat(seatNumber) {
    setSelected(prev =>
      prev.includes(seatNumber)
        ? prev.filter(s => s !== seatNumber)
        : [...prev, seatNumber]
    );
    setError('');
  }

  async function handleReserve() {
    if (!selected.length) { setError('Pick at least one seat first.'); return; }
    setBusy(true);
    setError('');
    try {
      const data = await reserve({ userId: user.id, eventId, seatNumbers: selected });
      setReservation(data);
      setStep(STEPS.RESERVED);
      // Refresh seat statuses so grid reflects what's now on hold
      fetchEvent();
    } catch (err) {
      setError(err.message);
      if (err.message.toLowerCase().includes('unavailable')) {
        // Refresh so user sees which seats are gone
        fetchEvent();
        setSelected([]);
      }
    } finally {
      setBusy(false);
    }
  }

  async function handleConfirm() {
    setBusy(true);
    setError('');
    try {
      const data = await confirmBooking({ reservationId: reservation.reservationId, userId: user.id });
      setBooking(data);
      setStep(STEPS.CONFIRMED);
    } catch (err) {
      setError(err.message);
      if (err.message.toLowerCase().includes('expired')) {
        setStep(STEPS.SELECTING);
        setReservation(null);
        setSelected([]);
        fetchEvent();
      }
    } finally {
      setBusy(false);
    }
  }

  function handleExpired() {
    setStep(STEPS.SELECTING);
    setReservation(null);
    setSelected([]);
    fetchEvent();
  }

  if (loading) return <div className="state-msg">Loading seats…</div>;
  if (!event) return <div className="state-msg error">{error || 'Event not found.'}</div>;

  const eventDate = new Date(event.dateTime);

  if (step === STEPS.CONFIRMED) {
    return (
      <div className="confirmation">
        <div className="confirm-icon">✓</div>
        <h2 className="confirm-title">You're in.</h2>
        <p className="confirm-ref">{booking.bookingRef}</p>
        <p className="confirm-event">{event.name}</p>
        <p className="confirm-venue">{event.venue}</p>
        <p className="confirm-date">{eventDate.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })} · {eventDate.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}</p>
        <div className="confirm-seats">
          {booking.seatNumbers.map(s => <span key={s} className="confirm-seat-badge">{s}</span>)}
        </div>
        <button className="btn-ghost" onClick={onBack}>Browse more events</button>
      </div>
    );
  }

  return (
    <div className="booking-flow">
      <button className="back-btn" onClick={onBack}>← All events</button>

      <div className="event-header">
        <h2 className="event-title">{event.name}</h2>
        <p className="event-meta">{event.venue} · {eventDate.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })} · {eventDate.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}</p>
      </div>

      {step === STEPS.RESERVED && (
        <CountdownTimer expiresAt={reservation.expiresAt} onExpired={handleExpired} />
      )}

      <SeatGrid
        seats={event.seats}
        selected={step === STEPS.SELECTING ? selected : reservation.seatNumbers}
        onToggle={toggleSeat}
        disabled={step === STEPS.RESERVED}
      />

      {error && (
        <div className="inline-error">{error}</div>
      )}

      <div className="booking-actions">
        {step === STEPS.SELECTING && (
          <>
            <p className="selection-summary">
              {selected.length ? `${selected.length} seat${selected.length > 1 ? 's' : ''} selected: ${selected.join(', ')}` : 'No seats selected'}
            </p>
            <button className="btn-primary" onClick={handleReserve} disabled={busy || !selected.length}>
              {busy ? 'Reserving…' : 'Reserve seats'}
            </button>
          </>
        )}
        {step === STEPS.RESERVED && (
          <>
            <p className="selection-summary">
              Holding: {reservation.seatNumbers.join(', ')}
            </p>
            <button className="btn-primary" onClick={handleConfirm} disabled={busy}>
              {busy ? 'Confirming…' : 'Confirm booking'}
            </button>
            <button className="btn-ghost" onClick={() => { setStep(STEPS.SELECTING); setReservation(null); setSelected([]); fetchEvent(); }}>
              Release seats
            </button>
          </>
        )}
      </div>
    </div>
  );
}
