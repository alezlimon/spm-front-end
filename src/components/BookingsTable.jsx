import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import '../App.css';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5005/api';

const getEntityId = (value) => {
  if (!value) return null;
  if (typeof value === 'string') return value;
  return value._id || value.id || null;
};

const toInputDate = (dateValue) => {
  const date = new Date(dateValue);
  if (Number.isNaN(date.getTime())) return '';

  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const normalizeStatus = (status) => (status || '').toLowerCase();

export default function BookingsTable({ refreshKey }) {
  const { propertyId } = useParams();
  const [bookings, setBookings] = useState([]);
  const [selectedDate, setSelectedDate] = useState(() => toInputDate(new Date()));
  const [statusFilter, setStatusFilter] = useState('all');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchBookings = async () => {
      setLoading(true);
      setError('');

      try {
        const [roomsRes, bookingsRes] = await Promise.all([
          propertyId
            ? fetch(`${API_URL}/properties/${propertyId}/rooms`)
            : fetch(`${API_URL}/rooms`),
          fetch(`${API_URL}/bookings`)
        ]);

        if (!roomsRes.ok || !bookingsRes.ok) {
          throw new Error('Error fetching bookings');
        }

        const [roomsData, bookingsData] = await Promise.all([
          roomsRes.json(),
          bookingsRes.json()
        ]);

        const roomIds = new Set((roomsData || []).map((room) => room._id));
        const scopedBookings = (bookingsData || []).filter((booking) => {
          const bookingRoomId = getEntityId(booking.room) || getEntityId(booking.roomId);
          return bookingRoomId ? roomIds.has(bookingRoomId) : false;
        });

        setBookings(scopedBookings);
      } catch (err) {
        setError(err.message || 'Error fetching bookings');
      } finally {
        setLoading(false);
      }
    };

    fetchBookings();
  }, [propertyId, refreshKey]);

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

    const value = normalizeStatus(status);

    if (value === 'confirmed') return 'status-available';
    if (value === 'checked-in') return 'status-occupied';
    if (value === 'checked-out') return 'status-maintenance';
    if (value === 'cancelled') return 'status-dirty';

    return 'status-maintenance';
  };

  const filteredBookings = bookings.filter((booking) => {
    const bookingCheckIn = toInputDate(booking.checkIn || booking.checkInDate);
    const bookingCheckOut = toInputDate(booking.checkOut || booking.checkOutDate);
    const hasValidRange = Boolean(bookingCheckIn && bookingCheckOut);
    const matchesDate = hasValidRange
      ? selectedDate >= bookingCheckIn && selectedDate <= bookingCheckOut
      : false;

    if (!matchesDate) {
      return false;
    }

    if (statusFilter === 'all') {
      return true;
    }

    return normalizeStatus(booking.status) === statusFilter;
  });

  return (
    <div className="bookings-table-wrapper">
      <div className="bookings-table-header">
        <div className="bookings-table-header-top">
          <h3>Today</h3>

          <div className="bookings-header-controls">
            <label className="bookings-date-control" htmlFor="bookings-date-filter">
              <svg
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                aria-hidden="true"
              >
                <rect x="3" y="5" width="18" height="16" rx="2" stroke="currentColor" strokeWidth="1.6" />
                <path d="M8 3V7" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
                <path d="M16 3V7" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
                <path d="M3 10H21" stroke="currentColor" strokeWidth="1.6" />
              </svg>
              <input
                id="bookings-date-filter"
                type="date"
                value={selectedDate}
                onChange={(event) => setSelectedDate(event.target.value)}
              />
            </label>

            <label className="bookings-status-control" htmlFor="bookings-status-filter">
              <span>Status</span>
              <select
                id="bookings-status-filter"
                value={statusFilter}
                onChange={(event) => setStatusFilter(event.target.value)}
              >
                <option value="all">All</option>
                <option value="confirmed">Confirmed</option>
                <option value="cancelled">Cancelled</option>
                <option value="checked-in">Checked In</option>
                <option value="checked-out">Checked Out</option>
              </select>
            </label>
          </div>
        </div>

        <p>Track reservations for the selected day and filter by status.</p>
      </div>

      {loading && <p className="page-feedback">Loading bookings...</p>}
      {error && <p className="page-feedback page-feedback-error">{error}</p>}

      {!loading && !error && filteredBookings.length === 0 && (
        <p className="page-feedback">No bookings found.</p>
      )}

      {!loading && !error && filteredBookings.length > 0 && (
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
              {filteredBookings.map((booking) => (
                <tr key={booking._id}>
                  <td className="booking-reference">{booking._id.slice(-6).toUpperCase()}</td>
                  <td>{getGuestName(booking)}</td>
                  <td>{getRoomLabel(booking)}</td>
                  <td>{formatDate(booking.checkIn || booking.checkInDate)}</td>
                  <td>{formatDate(booking.checkOut || booking.checkOutDate)}</td>
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