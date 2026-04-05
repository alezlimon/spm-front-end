import { useCallback, useEffect, useState } from 'react';
import { checkInBooking, checkOutBooking, getBookingById } from '../api/bookingsApi';
import { formatDisplayDate } from '../utils/date';
import AssignGuestToBooking from './AssignGuestToBooking';
import { ErrorState, LoadingState } from './PageState';

const getGuestLabel = (booking) => {
  if (!booking?.guest) {
    return 'Unassigned';
  }

  return `${booking.guest.firstName || ''} ${booking.guest.lastName || ''}`.trim();
};

const getRoomLabel = (booking) => {
  const room = booking?.room;

  if (!room) {
    return '—';
  }

  if (typeof room === 'string') {
    return room;
  }

  return room.roomNumber ? `Room ${room.roomNumber}` : room._id || '—';
};

export default function BookingDetailPage({ bookingId, onClose, onUpdated }) {
  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(true);
  const [loadingError, setLoadingError] = useState('');
  const [actionLoading, setActionLoading] = useState(false);
  const [actionError, setActionError] = useState('');
  const [actionSuccess, setActionSuccess] = useState('');

  const loadBooking = useCallback(async ({ showLoader = false } = {}) => {
    if (!bookingId) {
      setBooking(null);
      setLoading(false);
      return null;
    }

    if (showLoader) {
      setLoading(true);
      setLoadingError('');
      setActionSuccess('');
    }

    try {
      const bookingData = await getBookingById(bookingId);
      setBooking(bookingData || null);
      return bookingData || null;
    } catch (error) {
      setLoadingError(error.message || 'Could not load booking details');
      setBooking(null);
      return null;
    } finally {
      if (showLoader) {
        setLoading(false);
      }
    }
  }, [bookingId]);

  useEffect(() => {
    loadBooking({ showLoader: true });
  }, [loadBooking]);

  const handleCheckIn = async () => {
    if (!booking?._id) {
      return;
    }

    setActionLoading(true);
    setActionError('');
    setActionSuccess('');

    try {
      await checkInBooking(booking._id);
      await loadBooking();
      onUpdated?.();
      setActionSuccess('Booking checked in successfully.');
    } catch (error) {
      setActionError(error.message || 'Could not check in booking');
    } finally {
      setActionLoading(false);
    }
  };

  const handleCheckOut = async () => {
    if (!booking?._id) {
      return;
    }

    setActionLoading(true);
    setActionError('');
    setActionSuccess('');

    try {
      await checkOutBooking(booking._id);
      await loadBooking();
      onUpdated?.();
      setActionSuccess('Booking checked out successfully.');
    } catch (error) {
      setActionError(error.message || 'Could not check out booking');
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-panel" onClick={(event) => event.stopPropagation()}>
        <div className="modal-header">
          <div>
            <h2>Booking Detail</h2>
            <p className="modal-section-label">
              {booking?._id ? `Reference ${booking._id.slice(-6).toUpperCase()}` : 'Reservation'}
            </p>
          </div>
          <button className="modal-close" onClick={onClose} type="button" aria-label="Close">✕</button>
        </div>

        <div className="modal-body">
          {loading && <LoadingState message="Loading booking details..." />}
          {!loading && <ErrorState message={loadingError} />}

          {!loading && !loadingError && booking && (
            <>
          <div className="modal-pricing-summary">
            <div className="modal-pricing-row">
              <span>Guest</span>
              <strong>{getGuestLabel(booking)}</strong>
            </div>
            <div className="modal-pricing-row">
              <span>Room</span>
              <strong>{getRoomLabel(booking)}</strong>
            </div>
            <div className="modal-pricing-row">
              <span>Check-in</span>
              <strong>{formatDisplayDate(booking.checkIn || booking.checkInDate)}</strong>
            </div>
            <div className="modal-pricing-row">
              <span>Check-out</span>
              <strong>{formatDisplayDate(booking.checkOut || booking.checkOutDate)}</strong>
            </div>
            <div className="modal-pricing-row">
              <span>Status</span>
              <strong>{booking.status || 'Unknown'}</strong>
            </div>
            {typeof booking.totalPrice === 'number' && (
              <div className="modal-pricing-row">
                <span>Total price</span>
                <strong>€{booking.totalPrice}</strong>
              </div>
            )}
          </div>

          <div className="login-action-row" style={{ marginBottom: '12px' }}>
            <button
              type="button"
              className="primary-button"
              disabled={actionLoading || booking.status === 'Checked-in'}
              onClick={handleCheckIn}
            >
              {actionLoading ? 'Processing...' : 'Check in'}
            </button>
            <button
              type="button"
              className="secondary-button"
              disabled={actionLoading || booking.status !== 'Checked-in'}
              onClick={handleCheckOut}
            >
              Check out
            </button>
          </div>

          <ErrorState message={actionError} />
          {actionSuccess && <p className="form-feedback form-feedback-success">{actionSuccess}</p>}

          <AssignGuestToBooking
            bookingId={booking._id}
            onSuccess={async () => {
              await loadBooking();
              setActionError('');
              onUpdated?.();
              setActionSuccess('Guest assignment updated successfully.');
            }}
          />
            </>
          )}
        </div>
      </div>
    </div>
  );
}
