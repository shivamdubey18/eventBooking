import { useState } from 'react';
import { useAuth } from '../context/AuthContext';

export default function Login() {
  const { login } = useAuth();
  const [username, setUsername] = useState('');
  const [error, setError] = useState('');

  function handleSubmit(e) {
    e.preventDefault();
    const trimmed = username.trim();
    if (!trimmed) { setError('Enter a username to continue'); return; }
    if (trimmed.length < 2) { setError('Username must be at least 2 characters'); return; }
    login(trimmed);
  }

  return (
    <div className="login-wrap">
      <div className="login-card">
        <div className="login-brand">
          <span className="brand-dot" />
          SeatFlow
        </div>
        <p className="login-sub">Reserve seats for the events you care about.</p>
        <form onSubmit={handleSubmit} className="login-form">
          <label className="field-label" htmlFor="username">Your name</label>
          <input
            id="username"
            className="field-input"
            type="text"
            placeholder="e.g. alex"
            value={username}
            onChange={e => { setUsername(e.target.value); setError(''); }}
            autoFocus
          />
          {error && <p className="field-error">{error}</p>}
          <button type="submit" className="btn-primary">Get started</button>
        </form>
        <p className="login-note">No password needed — just a name to identify your reservations.</p>
      </div>
    </div>
  );
}
