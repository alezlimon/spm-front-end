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
      .then((res) => {
        if (!res.ok) throw new Error('Error fetching bookings');
        return res.json();
      })
      .then((data) => setBookings(data))
      .catch((err) => setError(err.message || 'Error fetching bookings'))
      .finally(() => setLoading(false));
  }, []);

  const formatDate = (dateValue) => {
    if (!dateValue) return '—';
    return new Date(dateValue).toLocaleDateString();
  };

  const getGuestName = (booking) => {
    if (!booking.guest) return 'Unassigned';
    return `${booking.guest.firstName} ${booking.guest.lastName}`;
  };

  const getRoomLabel = (booking) => {
    if (!booking.room) return '—';
    return `Room ${booking.room.roomNumber}`;
  };

  const getStatusClass = (status) => {
    if (!status) return 'status-maintenance';

    const value = status.toLowerCase();

    if (value === 'confirmed') return 'status-available';
    if (value === 'checked-in') return 'status-occupied';
    if (value === 'checked-out') return 'status-maintenance';
    if (value === 'cancelled') return 'status-dirty';

    return 'status-maintenance';
  };

  return (
    <div className="bookings-table-wrapper">
      <div className="bookings-table-header">
        <h3>Upcoming Reservations</h3>
        <p>Track guest assignment, room allocation, and reservation status.</p>
      </div>

      {loading && <p className="page-feedback">Loading bookings...</p>}
      {error && <p className="page-feedback page-feedback-error">{error}</p>}

      {!loading && !error && bookings.length === 0 && (
        <p className="page-feedback">No bookings found.</p>
      )}

      {!loading && !error && bookings.length > 0 && (
        <div className="bookings-table-scroll">
          <table className="bookings-table">
            <thead>
              <tr>
                <th>Reference</th>
                <th>Guest</th>
                <th>Room</th>
                <th>Check-In</th>
                <th>Check-Out</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>

            <tbody>
              {bookings.map((booking) => (
                <tr key={booking._id}>
                  <td className="booking-reference">{booking._id.slice(-6).toUpperCase()}</td>
                  <td>{getGuestName(booking)}</td>
                  <td>{getRoomLabel(booking)}</td>
                  <td>{formatDate(booking.checkInDate)}</td>
                  <td>{formatDate(booking.checkOutDate)}</td>
                  <td>
                    <span className={`status-badge ${getStatusClass(booking.status)}`}>
                      {booking.status || 'Unknown'}
                    </span>
                  </td>
                  <td>
                    <button className="secondary-button">View</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}