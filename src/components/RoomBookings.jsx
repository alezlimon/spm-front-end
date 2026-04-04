import { useEffect, useState } from 'react';
import { getAuthHeaders } from '../utils/auth';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5005/api';

export default function RoomBookings({ roomId }) {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!roomId) return;
    setLoading(true);
    setError('');
    fetch(`${API_URL}/rooms/${roomId}/bookings`)
      .then(res => res.json())
      .then(data => setBookings(data))
      .catch(() => setError('Could not load bookings'))
      .finally(() => setLoading(false));
  }, [roomId]);

  if (!roomId) return null;

  return (
    <div style={{marginTop:12}}>
      <strong>Booking history:</strong>
      {loading && <p style={{color:'#6b7280'}}>Loading bookings...</p>}
      {error && <p style={{color:'#b91c1c'}}>{error}</p>}
      <ul style={{listStyle:'none',padding:0}}>
        {bookings.map(b => (
          <li key={b._id} style={{background:'#f3f4f6',borderRadius:6,padding:10,marginBottom:8}}>
            <span style={{fontWeight:600}}>{b.guest?.firstName} {b.guest?.lastName}</span> —
            <span style={{color:'#6b7280'}}> {new Date(b.checkIn).toLocaleDateString()} to {new Date(b.checkOut).toLocaleDateString()}</span>
            <br/>
            <span style={{color:'#6b7280'}}>Status: {b.status}</span>
            <div style={{marginTop:6,display:'flex',gap:8}}>
              {b.status !== 'Checked-in' && (
                <button
                  style={{background:'#059669',color:'#fff',border:'none',borderRadius:6,padding:'4px 10px',fontWeight:600,cursor:'pointer'}}
                  onClick={async () => {
                    await fetch(`${API_URL}/bookings/${b._id}/checkin`, {
                      method: 'PUT',
                      headers: getAuthHeaders()
                    });
                    // Refresh bookings
                    fetch(`${API_URL}/rooms/${roomId}/bookings`).then(res => res.json()).then(setBookings);
                  }}
                >Check-in</button>
              )}
              {b.status === 'Checked-in' && (
                <button
                  style={{background:'#2563eb',color:'#fff',border:'none',borderRadius:6,padding:'4px 10px',fontWeight:600,cursor:'pointer'}}
                  onClick={async () => {
                    await fetch(`${API_URL}/bookings/${b._id}/checkout`, {
                      method: 'PUT',
                      headers: getAuthHeaders()
                    });
                    // Refresh bookings
                    fetch(`${API_URL}/rooms/${roomId}/bookings`).then(res => res.json()).then(setBookings);
                  }}
                >Check-out</button>
              )}
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
