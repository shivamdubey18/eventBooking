import { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import Login from './components/Login';
import EventList from './components/EventList';
import BookingFlow from './components/BookingFlow';
import './App.css';

function App() {
  const { user, logout } = useAuth();
  const [selectedEvent, setSelectedEvent] = useState(null);

  if (!user) return <Login />;

  return (
    <div className="app">
      <header className="app-header">
        <div className="header-brand">
          <span className="brand-dot" />
          SeatFlow
        </div>
        <div className="header-user">
          <span className="user-name">{user.username}</span>
          <button className="btn-logout" onClick={logout}>Sign out</button>
        </div>
      </header>

      <main className="app-main">
        {selectedEvent ? (
          <BookingFlow eventId={selectedEvent} onBack={() => setSelectedEvent(null)} />
        ) : (
          <EventList onSelect={setSelectedEvent} />
        )}
      </main>
    </div>
  );
}

export default function Root() {
  return (
    <AuthProvider>
      <App />
    </AuthProvider>
  );
}
