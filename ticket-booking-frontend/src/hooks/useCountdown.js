import { useState, useEffect } from 'react';

export function useCountdown(expiresAt) {
  const [secondsLeft, setSecondsLeft] = useState(null);

  useEffect(() => {
    if (!expiresAt) { setSecondsLeft(null); return; }

    const tick = () => {
      const diff = Math.max(0, Math.floor((new Date(expiresAt) - Date.now()) / 1000));
      setSecondsLeft(diff);
    };

    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [expiresAt]);

  if (secondsLeft === null) return null;
  const m = String(Math.floor(secondsLeft / 60)).padStart(2, '0');
  const s = String(secondsLeft % 60).padStart(2, '0');
  return { display: `${m}:${s}`, expired: secondsLeft === 0, raw: secondsLeft };
}
