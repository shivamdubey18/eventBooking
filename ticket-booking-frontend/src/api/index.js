const BASE = '/api';

async function request(path, options = {}) {
  const res = await fetch(`${BASE}${path}`, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || `Request failed (${res.status})`);
  return data;
}

export const getEvents = () => request('/events');
export const getEvent = (id) => request(`/events/${id}`);
export const reserve = (body) => request('/reserve', { method: 'POST', body: JSON.stringify(body) });
export const confirmBooking = (body) => request('/bookings', { method: 'POST', body: JSON.stringify(body) });
