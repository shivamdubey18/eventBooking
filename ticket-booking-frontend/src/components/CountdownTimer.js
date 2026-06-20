import { useCountdown } from '../hooks/useCountdown';

export default function CountdownTimer({ expiresAt, onExpired }) {
  const countdown = useCountdown(expiresAt);

  if (!countdown) return null;

  if (countdown.expired) {
    onExpired?.();
    return (
      <div className="timer expired">
        Your hold expired — seats have been released.
      </div>
    );
  }

  const urgent = countdown.raw <= 60;

  return (
    <div className={`timer ${urgent ? 'urgent' : ''}`}>
      <span className="timer-label">Seat hold expires in</span>
      <span className="timer-display">{countdown.display}</span>
    </div>
  );
}
