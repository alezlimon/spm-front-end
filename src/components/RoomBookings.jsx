import { useCallback, useEffect, useRef, useState } from 'react';
import { checkInBooking, checkOutBooking } from '../api/bookingsApi';
import { canCheckIn, canCheckOut } from '../utils/bookingStatus';
import { listRoomBookings } from '../api/roomsApi';
import { formatDisplayDate } from '../utils/date';
import { EmptyState, ErrorState, LoadingState } from './PageState';

export default function RoomBookings({ roomId }) {
  const [bookings, setBookings] = useState([]);
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

  useEffect(() => {
    return () => {
      const activeTimeouts = Object.values(feedbackTimeoutsRef.current);
      activeTimeouts.forEach((timeoutId) => clearTimeout(timeoutId));
      feedbackTimeoutsRef.current = {};
    };
  }, []);

  const handleBookingAction = async (bookingId, bookingAction, successMessage, fallbackMessage) => {
    setRowActionLoading(bookingId, true);
    setRowFeedback(bookingId, null);

    try {
      await bookingAction(bookingId);
      await refreshBookings();
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
          bookingId,
          message: errorMessage
        },
        ...prev
      ].slice(0, 4));
    } finally {
      setRowActionLoading(bookingId, false);
    }
  };

  if (!roomId) return null;

  return (
    <div style={{marginTop:12}}>
      <strong>Booking history:</strong>
      {loading && <LoadingState message="Loading bookings..." />}
      {!loading && <ErrorState message={error} />}
      {!loading && !error && bookings.length === 0 && (
        <EmptyState message="No bookings found for this room." />
      )}

      {recentActionErrors.length > 0 && (
        <div className="ops-errors-card" role="status" aria-live="polite" style={{ marginBottom: '10px' }}>
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
                <span className="ops-errors-ref">#{errorItem.bookingId.slice(-6).toUpperCase()}</span>
                <span>{errorItem.message}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      <ul style={{listStyle:'none',padding:0}}>
        {bookings.map(b => (
          <li key={b._id} style={{background:'#f3f4f6',borderRadius:6,padding:10,marginBottom:8}}>
            <span style={{fontWeight:600}}>{b.guest?.firstName} {b.guest?.lastName}</span> —
            <span style={{color:'#6b7280'}}> {formatDisplayDate(b.checkIn)} to {formatDisplayDate(b.checkOut)}</span>
            <br/>
            <span style={{color:'#6b7280'}}>Status: {b.status}</span>
            <div className="room-bookings-actions" style={{marginTop:6,display:'flex',gap:8}}>
              {canCheckIn(b.status) && (
                <button
                  className="primary-button room-bookings-action-btn"
                  disabled={Boolean(actionLoadingById[b._id])}
                  onClick={() => handleBookingAction(
                    b._id,
                    checkInBooking,
                    'Checked in successfully.',
                    'Could not check in booking'
                  )}
                >{actionLoadingById[b._id] ? '...' : 'Check in'}</button>
              )}
              {canCheckOut(b.status) && (
                <button
                  className="primary-button room-bookings-action-btn"
                  disabled={Boolean(actionLoadingById[b._id])}
                  onClick={() => handleBookingAction(
                    b._id,
                    checkOutBooking,
                    'Checked out successfully.',
                    'Could not check out booking'
                  )}
                >{actionLoadingById[b._id] ? '...' : 'Check out'}</button>
              )}
            </div>

            {actionFeedbackById[b._id] && (
              <p
                className={
                  actionFeedbackById[b._id].type === 'error'
                    ? 'form-feedback form-feedback-error'
                    : 'form-feedback form-feedback-success'
                }
                style={{ marginTop: '8px' }}
              >
                {actionFeedbackById[b._id].message}
              </p>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}
