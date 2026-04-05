import { useCallback, useEffect, useState } from 'react';
import { checkInBooking, checkOutBooking } from '../api/bookingsApi';
import { listRoomBookings } from '../api/roomsApi';

export default function RoomBookings({ roomId }) {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const refreshBookings = useCallback(async () => {
    const data = await listRoomBookings(roomId);
    setBookings(data || []);
  }, [roomId]);

  useEffect(() => {
    if (!roomId) return;

    const loadBookings = async () => {
      setLoading(true);
      setError('');

      try {
        await refreshBookings();
      } catch {
        setError('Could not load bookings');
      } finally {
        setLoading(false);
      }
    };

    loadBookings();
  }, [roomId, refreshBookings]);

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
                    await checkInBooking(b._id);
                    await refreshBookings();
                  }}
                >Check-in</button>
              )}
              {b.status === 'Checked-in' && (
                <button
                  style={{background:'#2563eb',color:'#fff',border:'none',borderRadius:6,padding:'4px 10px',fontWeight:600,cursor:'pointer'}}
                  onClick={async () => {
                    await checkOutBooking(b._id);
                    await refreshBookings();
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
