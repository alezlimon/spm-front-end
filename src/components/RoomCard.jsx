function RoomCard({ room, getStatusClass, updateRoomStatus, currentBooking }) {
  let actionButton = null;

  switch (room.status) {
    case 'Available':
      actionButton = (
        <button onClick={() => updateRoomStatus(room._id, 'Occupied')}>
          Check In
        </button>
      );
      break;
    case 'Occupied':
      actionButton = (
        <button onClick={() => updateRoomStatus(room._id, 'Dirty')}>
          Check Out
        </button>
      );
      break;
    case 'Dirty':
      actionButton = (
        <button onClick={() => updateRoomStatus(room._id, 'Available')}>
          Mark Clean
        </button>
      );
      break;
    default:
      actionButton = null;
  }

  const formatDate = (dateValue) => {
    if (!dateValue) return '—';
    return new Date(dateValue).toLocaleDateString();
  };

  const hasGuestBooking = currentBooking && currentBooking.guest;

  const guestName = hasGuestBooking
    ? `${currentBooking.guest.firstName} ${currentBooking.guest.lastName}`
    : '';

  return (
    <div className="room-card">
      <div className="room-card-top">
        <div className="room-card-heading">
          <h3>Room {room.roomNumber}</h3>
          <p className="room-card-subtitle">{room.type}</p>
        </div>

        <span className={`status-badge ${getStatusClass(room.status)}`}>
          {room.status}
        </span>
      </div>

      <div className="room-card-details">
        <div className="room-detail-item">
          <span>Rate</span>
          <strong>€{room.pricePerNight}</strong>
        </div>

        <div className="room-detail-item">
          <span>Clean</span>
          <strong>{room.isClean ? 'Yes' : 'No'}</strong>
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
              <strong>{formatDate(currentBooking.checkInDate)}</strong>
            </div>

            <div className="room-detail-item">
              <span>Check-Out</span>
              <strong>{formatDate(currentBooking.checkOutDate)}</strong>
            </div>
          </div>
        </div>
      )}

      {actionButton && <div className="room-actions">{actionButton}</div>}
    </div>
  );
}

export default RoomCard;