import { useCallback, useEffect, useState } from 'react';
import { checkInBooking, checkOutBooking } from '../api/bookingsApi';
import { canCheckIn, canCheckOut } from '../utils/bookingStatus';
import { listRoomBookings } from '../api/roomsApi';
import { formatDisplayDate } from '../utils/date';
import { EmptyState, ErrorState, LoadingState } from './PageState';

export default function RoomBookings({ roomId }) {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [actionLoadingId, setActionLoadingId] = useState(null);
  const [actionFeedbackById, setActionFeedbackById] = useState({});

  const setRowFeedback = (bookingId, feedback) => {
    setActionFeedbackById((prev) => ({
      ...prev,
      [bookingId]: feedback
    }));

    setTimeout(() => {
      setActionFeedbackById((prev) => {
        if (!prev[bookingId]) {
          return prev;
        }

        const next = { ...prev };
        delete next[bookingId];
        return next;
      });
    }, 3500);
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

  if (!roomId) return null;

  return (
    <div style={{marginTop:12}}>
      <strong>Booking history:</strong>
      {loading && <LoadingState message="Loading bookings..." />}
      {!loading && <ErrorState message={error} />}
      {!loading && !error && bookings.length === 0 && (
        <EmptyState message="No bookings found for this room." />
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
                  disabled={actionLoadingId === b._id}
                  onClick={async () => {
                    setActionLoadingId(b._id);
                    setRowFeedback(b._id, null);

                    try {
                      await checkInBooking(b._id);
                      await refreshBookings();
                      setRowFeedback(b._id, { type: 'success', message: 'Checked in successfully.' });
                    } catch (err) {
                      setRowFeedback(b._id, {
                        type: 'error',
                        message: err.message || 'Could not check in booking'
                      });
                    } finally {
                      setActionLoadingId(null);
                    }
                  }}
                >{actionLoadingId === b._id ? '...' : 'Check in'}</button>
              )}
              {canCheckOut(b.status) && (
                <button
                  className="primary-button room-bookings-action-btn"
                  disabled={actionLoadingId === b._id}
                  onClick={async () => {
                    setActionLoadingId(b._id);
                    setRowFeedback(b._id, null);

                    try {
                      await checkOutBooking(b._id);
                      await refreshBookings();
                      setRowFeedback(b._id, { type: 'success', message: 'Checked out successfully.' });
                    } catch (err) {
                      setRowFeedback(b._id, {
                        type: 'error',
                        message: err.message || 'Could not check out booking'
                      });
                    } finally {
                      setActionLoadingId(null);
                    }
                  }}
                >{actionLoadingId === b._id ? '...' : 'Check out'}</button>
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
