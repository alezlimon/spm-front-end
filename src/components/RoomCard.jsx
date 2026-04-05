import { formatCurrency } from '../utils/money';
import { useEffect, useState } from 'react';

function RoomCard({ room, updateRoomStatus, currentBooking }) {
  const [showCleanModal, setShowCleanModal] = useState(false);
  const [isSavingClean, setIsSavingClean] = useState(false);
  const [cleanError, setCleanError] = useState('');

  const isOutOfService = room.status === 'Maintenance';
  const isOccupied = room.status === 'Occupied';
  const isReadyForCheckIn = room.status === 'Available' && room.isClean;
  const isBlockedByCleaning = !isOutOfService && !isOccupied && !isReadyForCheckIn;

  let primaryStatusLabel = 'Dirty';
  let primaryStatusClass = 'room-primary-status-blocked';
  let readinessLabel = 'Needs cleaning';

  if (isOutOfService) {
    primaryStatusLabel = 'Out of Service';
    primaryStatusClass = 'room-primary-status-out';
    readinessLabel = 'Maintenance in progress';
  } else if (isOccupied) {
    primaryStatusLabel = 'Occupied';
    primaryStatusClass = 'room-primary-status-occupied';
    readinessLabel = 'Guest in room';
  } else if (isReadyForCheckIn) {
    primaryStatusLabel = 'Ready for Check-in';
    primaryStatusClass = 'room-primary-status-ready';
    readinessLabel = 'Ready';
  }

  const formatDate = (dateValue) => {
    if (!dateValue) return '—';
    return new Date(dateValue).toLocaleDateString();
  };

  const hasGuestBooking = currentBooking && currentBooking.guest;

  const guestName = hasGuestBooking
    ? `${currentBooking.guest.firstName} ${currentBooking.guest.lastName}`
    : '';

  const getUtcDateKey = (dateValue) => {
    const date = new Date(dateValue);
    return Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate());
  };

  const getCheckoutUrgency = () => {
    if (!isOccupied || !currentBooking) return '';

    const checkOutValue = currentBooking.checkOut || currentBooking.checkOutDate;
    if (!checkOutValue) return '';

    const checkoutKey = getUtcDateKey(checkOutValue);
    if (Number.isNaN(checkoutKey)) return '';

    const today = new Date();
    const todayKey = Date.UTC(today.getUTCFullYear(), today.getUTCMonth(), today.getUTCDate());
    const diffDays = Math.round((checkoutKey - todayKey) / 86400000);

    if (diffDays === 0) return 'Checkout Today';
    if (diffDays === 1) return 'Checkout Tomorrow';
    return '';
  };

  const checkoutUrgency = getCheckoutUrgency();

  useEffect(() => {
    if (!showCleanModal) return undefined;

    const handleEscape = (event) => {
      if (event.key === 'Escape' && !isSavingClean) {
        setShowCleanModal(false);
      }
    };

    window.addEventListener('keydown', handleEscape);

    return () => {
      window.removeEventListener('keydown', handleEscape);
    };
  }, [showCleanModal, isSavingClean]);

  const confirmMarkClean = async () => {
    setIsSavingClean(true);
    setCleanError('');

    try {
      await updateRoomStatus(room._id, 'Available', { isClean: true });
      setShowCleanModal(false);
    } catch {
      setCleanError('Could not mark room as clean. Please try again.');
    } finally {
      setIsSavingClean(false);
    }
  };

  return (
    <div className="room-card">
      <div className="room-card-top">
        <div className="room-card-heading">
          <h3>Room {room.roomNumber}</h3>
          <p className="room-card-subtitle">{room.type}</p>
          {checkoutUrgency && <span className="room-checkout-urgency">{checkoutUrgency}</span>}
        </div>

        <span className={`room-primary-status ${primaryStatusClass}`}>
          {primaryStatusLabel}
        </span>
      </div>

      <div className="room-card-details">
        <div className="room-detail-item">
          <span>Rate</span>
          <strong>{formatCurrency(room.pricePerNight)}</strong>
        </div>

        <div className="room-detail-item">
          <span>Readiness</span>
          <strong>{readinessLabel}</strong>
        </div>
      </div>

      {hasGuestBooking && (
        <div className="room-card-booking">
          <div className="room-detail-item room-detail-item-full">
            <span>Guest</span>
            <strong>{guestName}</strong>
          </div>

          <div className="room-card-booking-dates">
            <div className="room-detail-item">
              <span>Check-In</span>
              <strong>{formatDate(currentBooking.checkIn || currentBooking.checkInDate)}</strong>
            </div>

            <div className="room-detail-item">
              <span>Check-Out</span>
              <strong>{formatDate(currentBooking.checkOut || currentBooking.checkOutDate)}</strong>
            </div>
          </div>
        </div>
      )}

      <div className="room-actions">
        {isOccupied && (
          <button onClick={() => updateRoomStatus(room._id, 'Dirty', { isClean: false })}>
            Check Out
          </button>
        )}

        {isReadyForCheckIn && (
          <button onClick={() => updateRoomStatus(room._id, 'Occupied')}>
            Check In
          </button>
        )}

        {isBlockedByCleaning && (
          <button
            onClick={() => {
              setCleanError('');
              setShowCleanModal(true);
            }}
          >
            Mark as Clean
          </button>
        )}

        {isOutOfService && (
          <button className="room-action-blocked" disabled>
            Out of Service
          </button>
        )}
      </div>

      {showCleanModal && (
        <div
          className="room-clean-modal-backdrop"
          role="presentation"
          onClick={(event) => {
            if (event.target === event.currentTarget && !isSavingClean) {
              setShowCleanModal(false);
            }
          }}
        >
          <div className="room-clean-modal" role="dialog" aria-modal="true">
            <h4>Confirm Manual Cleaning</h4>
            <p>HSK has not confirmed cleaning for this room.</p>
            <p>Do you want to mark it as clean anyway?</p>
            {cleanError && <p className="room-clean-modal-error">{cleanError}</p>}
            <div className="room-clean-modal-actions">
              <button
                className="room-clean-modal-cancel"
                onClick={() => setShowCleanModal(false)}
                disabled={isSavingClean}
              >
                Cancel
              </button>
              <button
                className="room-clean-modal-ok"
                onClick={confirmMarkClean}
                disabled={isSavingClean}
              >
                {isSavingClean ? 'Saving...' : 'Mark as Clean'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default RoomCard;