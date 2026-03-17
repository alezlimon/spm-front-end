function RoomCard({ room, getStatusClass, updateRoomStatus }) {
  return (
    <div className="room-card">
      <h3>Room {room.roomNumber}</h3>
      <p>Type: {room.type}</p>
      <p>Price: €{room.pricePerNight}</p>
      <p>Clean: {room.isClean ? 'Yes' : 'No'}</p>

      <span className={`status-badge ${getStatusClass(room.status)}`}>
        {room.status}
      </span>

      <div className="room-actions">
        <button onClick={() => updateRoomStatus(room._id, 'Occupied')}>
          Check In
        </button>

        <button onClick={() => updateRoomStatus(room._id, 'Dirty')}>
          Check Out
        </button>

        <button onClick={() => updateRoomStatus(room._id, 'Available')}>
          Mark Clean
        </button>
      </div>
    </div>
  )
}

export default RoomCard