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

  return (
    <div className="room-card">
      <div className="room-card-top">
        <div>
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

        {room.status === 'Occupied' && currentBooking && currentBooking.guest && (
          <div className="room-detail-item room-detail-item-full">
            <span>Guest</span>
            <strong>
              {currentBooking.guest.firstName} {currentBooking.guest.lastName}
            </strong>
          </div>
        )}
      </div>

      {actionButton && <div className="room-actions">{actionButton}</div>}
    </div>
  );
}

export default RoomCard;