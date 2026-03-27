import { useEffect, useState } from 'react';
import '../App.css';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5005/api';

export default function BookingsTable() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    setLoading(true);
    setError('');
    fetch(`${API_URL}/bookings`)
      .then(res => {
        if (!res.ok) throw new Error('Error fetching bookings');
        return res.json();
      })
      .then(data => setBookings(data))
      .catch(err => setError(err.message || 'Error fetching bookings'))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="bookings-table-wrapper">
      <h2>Bookings</h2>
      {loading && <p>Loading bookings...</p>}
      {error && <p style={{color:'#b91c1c'}}>{error}</p>}
      <table className="bookings-table">
        <thead>
          <tr>
            <th>ID</th>
            <th>Guest</th>
            <th>Room</th>
            <th>Check-in</th>
            <th>Check-out</th>
            <th>Status</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {bookings.map(b => (
            <tr key={b._id}>
              <td>{b._id}</td>
              <td>{b.guest ? `${b.guest.firstName} ${b.guest.lastName}` : '-'}</td>
              <td>{b.room ? b.room.roomNumber : '-'}</td>
              <td>{b.checkInDate ? new Date(b.checkInDate).toLocaleDateString() : '-'}</td>
              <td>{b.checkOutDate ? new Date(b.checkOutDate).toLocaleDateString() : '-'}</td>
              <td>
                <span className={`status-badge status-${b.status ? b.status.toLowerCase() : 'unknown'}`}>
                  {b.status || 'Unknown'}
                </span>
              </td>
              <td>
                {/* Placeholder for actions: view, edit, cancel */}
                <button>View</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
