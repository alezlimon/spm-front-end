



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
      <h3>Room {room.roomNumber}</h3>
      <p>Type: {room.type}</p>
      <p>Price: €{room.pricePerNight}</p>
      <p>Clean: {room.isClean ? 'Yes' : 'No'}</p>

      <span className={`status-badge ${getStatusClass(room.status)}`}>
        {room.status}
      </span>

      {/* Mostrar huésped si está ocupada */}
      {room.status === 'Occupied' && currentBooking && currentBooking.guest && (
        <p style={{ margin: '8px 0', color: '#374151', fontWeight: 500 }}>
          Guest: {currentBooking.guest.firstName} {currentBooking.guest.lastName}
        </p>
      )}

      <div className="room-actions">
        {actionButton}
      </div>
    </div>
  );
}

export default RoomCard