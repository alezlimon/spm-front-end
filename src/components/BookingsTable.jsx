import { useCallback, useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { checkInBooking, checkOutBooking, listBookings } from '../api/bookingsApi';
import { listPropertyRooms } from '../api/propertiesApi';
import { listRooms } from '../api/roomsApi';
import { canCheckIn, canCheckOut } from '../utils/bookingStatus';
import { EmptyState, ErrorState, LoadingState } from '../components/PageState';
import { formatDisplayDate, toInputDate } from '../utils/date';
import '../App.css';

const getEntityId = (value) => {
  if (!value) return null;
  if (typeof value === 'string') return value;
  return value._id || value.id || null;
};

const normalizeStatus = (status) => (status || '').toLowerCase();

export default function BookingsTable({ refreshKey, onViewBooking }) {
  const { propertyId } = useParams();
  const [bookings, setBookings] = useState([]);
  const [selectedDate, setSelectedDate] = useState(() => toInputDate(new Date()));
  const [statusFilter, setStatusFilter] = useState('all');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [actionLoadingId, setActionLoadingId] = useState(null);
  const [actionError, setActionError] = useState('');

  const fetchBookings = useCallback(async () => {
    setLoading(true);
    setError('');

    try {
      const [roomsData, bookingsData] = await Promise.all([
        propertyId ? listPropertyRooms(propertyId) : listRooms(),
        listBookings()
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
  }, [propertyId]);

  useEffect(() => {
    fetchBookings();
  }, [fetchBookings, refreshKey]);

  const handleQuickCheckIn = async (bookingId) => {
    setActionLoadingId(bookingId);
    setActionError('');

    try {
      await checkInBooking(bookingId);
      await fetchBookings();
    } catch (err) {
      setActionError(err.message || 'Could not check in booking');
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleQuickCheckOut = async (bookingId) => {
    setActionLoadingId(bookingId);
    setActionError('');

    try {
      await checkOutBooking(bookingId);
      await fetchBookings();
    } catch (err) {
      setActionError(err.message || 'Could not check out booking');
    } finally {
      setActionLoadingId(null);
    }
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

      {loading && <LoadingState message="Loading bookings..." />}
      {!loading && <ErrorState message={error} />}
      {!loading && <ErrorState message={actionError} />}

      {!loading && !error && filteredBookings.length === 0 && (
        <EmptyState message="No bookings found." />
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
                  <td>{formatDisplayDate(booking.checkIn || booking.checkInDate)}</td>
                  <td>{formatDisplayDate(booking.checkOut || booking.checkOutDate)}</td>
                  <td>
                    <span className={`status-badge ${getStatusClass(booking.status)}`}>
                      {booking.status || 'Unknown'}
                    </span>
                  </td>
                  <td>
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <button
                        className="secondary-button"
                        onClick={() => onViewBooking?.(booking)}
                      >
                        View
                      </button>

                      {canCheckIn(booking.status) && (
                        <button
                          className="primary-button"
                          disabled={actionLoadingId === booking._id}
                          onClick={() => handleQuickCheckIn(booking._id)}
                        >
                          {actionLoadingId === booking._id ? '...' : 'Check in'}
                        </button>
                      )}

                      {canCheckOut(booking.status) && (
                        <button
                          className="primary-button"
                          disabled={actionLoadingId === booking._id}
                          onClick={() => handleQuickCheckOut(booking._id)}
                        >
                          {actionLoadingId === booking._id ? '...' : 'Check out'}
                        </button>
                      )}
                    </div>
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