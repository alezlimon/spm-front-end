import { useCallback, useEffect, useState } from 'react';
import { checkInBooking, checkOutBooking, getBookingById } from '../api/bookingsApi';
import { canCheckIn, canCheckOut } from '../utils/bookingStatus';
import { formatDisplayDate } from '../utils/date';
import { resolveBookingPricing } from '../utils/bookingPricing';
import { formatCurrency } from '../utils/money';
import AssignGuestToBooking from './AssignGuestToBooking';
import PaymentStatusBadge from './PaymentStatusBadge';
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
  const [actionLoadingType, setActionLoadingType] = useState('');
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

  const runBookingAction = async ({
    actionType,
    action,
    successMessage,
    fallbackMessage
  }) => {
    if (!booking?._id) {
      return;
    }

    setActionLoadingType(actionType);
    setActionError('');
    setActionSuccess('');

    try {
      await action(booking._id);
      await loadBooking();
      onUpdated?.();
      setActionSuccess(successMessage);
    } catch (error) {
      setActionError(error.message || fallbackMessage);
    } finally {
      setActionLoadingType('');
    }
  };

  const handleCheckIn = async () => {
    await runBookingAction({
      actionType: 'check-in',
      action: checkInBooking,
      successMessage: 'Booking checked in successfully.',
      fallbackMessage: 'Could not check in booking'
    });
  };

  const handleCheckOut = async () => {
    await runBookingAction({
      actionType: 'check-out',
      action: checkOutBooking,
      successMessage: 'Booking checked out successfully.',
      fallbackMessage: 'Could not check out booking'
    });
  };

  const pricing = resolveBookingPricing(booking);

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
            {booking.paymentStatus && (
              <div className="modal-pricing-row">
                <span>Payment</span>
                <PaymentStatusBadge status={booking.paymentStatus} />
              </div>
            )}
            {pricing.hasSnapshot && typeof pricing.base === 'number' && (
              <div className="modal-pricing-row">
                <span>Base</span>
                <strong>{formatCurrency(pricing.base, { currency: pricing.currency })}</strong>
              </div>
            )}
            {pricing.hasSnapshot && typeof pricing.taxes === 'number' && (
              <div className="modal-pricing-row">
                <span>Taxes</span>
                <strong>{formatCurrency(pricing.taxes, { currency: pricing.currency })}</strong>
              </div>
            )}
            {pricing.hasSnapshot && typeof pricing.discounts === 'number' && (
              <div className="modal-pricing-row">
                <span>Discounts</span>
                <strong>-{formatCurrency(Math.abs(pricing.discounts), { currency: pricing.currency })}</strong>
              </div>
            )}
            {typeof pricing.total === 'number' && (
              <div className="modal-pricing-row">
                <span>Total price</span>
                <strong>{formatCurrency(pricing.total, { currency: pricing.currency })}</strong>
              </div>
            )}
          </div>

          <div className="login-action-row" style={{ marginBottom: '12px' }}>
            <button
              type="button"
              className="primary-button"
              disabled={Boolean(actionLoadingType) || !canCheckIn(booking.status)}
              onClick={handleCheckIn}
            >
              {actionLoadingType === 'check-in' ? 'Processing...' : 'Check in'}
            </button>
            <button
              type="button"
              className="secondary-button"
              disabled={Boolean(actionLoadingType) || !canCheckOut(booking.status)}
              onClick={handleCheckOut}
            >
              {actionLoadingType === 'check-out' ? 'Processing...' : 'Check out'}
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
