import { useCallback, useEffect, useRef, useState } from 'react';
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
  const [actionLoadingById, setActionLoadingById] = useState({});
  const [actionFeedbackById, setActionFeedbackById] = useState({});
  const [recentActionErrors, setRecentActionErrors] = useState([]);
  const feedbackTimeoutsRef = useRef({});

  const setRowFeedback = (bookingId, feedback) => {
    if (feedbackTimeoutsRef.current[bookingId]) {
      clearTimeout(feedbackTimeoutsRef.current[bookingId]);
      delete feedbackTimeoutsRef.current[bookingId];
    }

    setActionFeedbackById((prev) => ({
      ...prev,
      [bookingId]: feedback
    }));

    if (!feedback) {
      return;
    }

    feedbackTimeoutsRef.current[bookingId] = setTimeout(() => {
      setActionFeedbackById((prev) => {
        if (!prev[bookingId]) {
          return prev;
        }

        const next = { ...prev };
        delete next[bookingId];
        return next;
      });
      delete feedbackTimeoutsRef.current[bookingId];
    }, 3500);
  };

  const setRowActionLoading = (bookingId, isLoading) => {
    setActionLoadingById((prev) => {
      if (isLoading) {
        return {
          ...prev,
          [bookingId]: true
        };
      }

      if (!prev[bookingId]) {
        return prev;
      }

      const next = { ...prev };
      delete next[bookingId];
      return next;
    });
  };

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

  useEffect(() => {
    return () => {
      const activeTimeouts = Object.values(feedbackTimeoutsRef.current);
      activeTimeouts.forEach((timeoutId) => clearTimeout(timeoutId));
      feedbackTimeoutsRef.current = {};
    };
  }, []);

  const handleBookingAction = async (
    bookingId,
    bookingReference,
    bookingAction,
    successMessage,
    fallbackMessage
  ) => {
    setRowActionLoading(bookingId, true);
    setRowFeedback(bookingId, null);

    try {
      await bookingAction(bookingId);
      await fetchBookings();
      setRowFeedback(bookingId, { type: 'success', message: successMessage });
    } catch (err) {
      const errorMessage = err.message || fallbackMessage;

      setRowFeedback(bookingId, {
        type: 'error',
        message: errorMessage
      });

      setRecentActionErrors((prev) => [
        {
          key: `${bookingId}-${Date.now()}`,
          reference: bookingReference,
          message: errorMessage
        },
        ...prev
      ].slice(0, 4));
    } finally {
      setRowActionLoading(bookingId, false);
    }
  };

  const handleQuickCheckIn = async (bookingId, bookingReference) => {
    await handleBookingAction(
      bookingId,
      bookingReference,
      checkInBooking,
      'Checked in successfully.',
      'Could not check in booking'
    );
  };

  const handleQuickCheckOut = async (bookingId, bookingReference) => {
    await handleBookingAction(
      bookingId,
      bookingReference,
      checkOutBooking,
      'Checked out successfully.',
      'Could not check out booking'
    );
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

      {!loading && !error && filteredBookings.length === 0 && (
        <EmptyState message="No bookings found." />
      )}

      {!loading && !error && filteredBookings.length > 0 && (
        <>
          {recentActionErrors.length > 0 && (
            <div className="ops-errors-card" role="status" aria-live="polite">
              <div className="ops-errors-card-header">
                <strong>Recent operation errors</strong>
                <button
                  type="button"
                  className="secondary-button"
                  onClick={() => setRecentActionErrors([])}
                >
                  Clear
                </button>
              </div>

              <ul className="ops-errors-list">
                {recentActionErrors.map((errorItem) => (
                  <li key={errorItem.key}>
                    <span className="ops-errors-ref">#{errorItem.reference}</span>
                    <span>{errorItem.message}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

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
                {filteredBookings.map((booking) => {
                  const bookingReference = booking._id.slice(-6).toUpperCase();

                  return (
                    <tr key={booking._id}>
                      <td className="booking-reference">{bookingReference}</td>
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
                              disabled={Boolean(actionLoadingById[booking._id])}
                              onClick={() => handleQuickCheckIn(booking._id, bookingReference)}
                            >
                              {actionLoadingById[booking._id] ? '...' : 'Check in'}
                            </button>
                          )}

                          {canCheckOut(booking.status) && (
                            <button
                              className="primary-button"
                              disabled={Boolean(actionLoadingById[booking._id])}
                              onClick={() => handleQuickCheckOut(booking._id, bookingReference)}
                            >
                              {actionLoadingById[booking._id] ? '...' : 'Check out'}
                            </button>
                          )}
                        </div>

                        {actionFeedbackById[booking._id] && (
                          <p
                            className={
                              actionFeedbackById[booking._id].type === 'error'
                                ? 'form-feedback form-feedback-error'
                                : 'form-feedback form-feedback-success'
                            }
                            style={{ marginTop: '8px' }}
                          >
                            {actionFeedbackById[booking._id].message}
                          </p>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
}