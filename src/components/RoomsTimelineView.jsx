const TIMELINE_DAYS = 10;

const getEntityId = (value) => {
  if (!value) return null;
  if (typeof value === 'string') return value;
  return value._id || value.id || null;
};

const parseUtcDate = (value) => {
  if (!value) return null;
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return null;

  return new Date(Date.UTC(parsed.getUTCFullYear(), parsed.getUTCMonth(), parsed.getUTCDate()));
};

const buildTimelineDays = () => {
  const now = new Date();
  const start = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));

  return Array.from({ length: TIMELINE_DAYS }, (_, index) => {
    const day = new Date(start);
    day.setUTCDate(start.getUTCDate() + index);
    return day;
  });
};

const formatDayLabel = (day) => {
  return day.toLocaleDateString('en-GB', {
    weekday: 'short',
    day: '2-digit',
    month: 'short',
    timeZone: 'UTC'
  });
};

const getBookingStatusClass = (status) => {
  const safeStatus = String(status || '').toLowerCase();

  if (safeStatus === 'confirmed') return 'timeline-booking-confirmed';
  if (safeStatus === 'checked-in') return 'timeline-booking-checked-in';
  if (safeStatus === 'checked-out') return 'timeline-booking-checked-out';
  if (safeStatus === 'cancelled') return 'timeline-booking-cancelled';

  return 'timeline-booking-default';
};

const getOperationalLabel = (room) => {
  if (room.status === 'Maintenance') return 'Out of Service';
  if (room.status === 'Occupied') return 'Occupied';
  if (room.status === 'Available' && room.isClean) return 'Ready';
  return 'Dirty';
};

const getBookingsForRoom = (bookings, roomId) => {
  return bookings
    .filter((booking) => {
      const bookingRoomId = getEntityId(booking.room) || getEntityId(booking.roomId);
      return bookingRoomId === roomId;
    })
    .map((booking) => {
      const start = parseUtcDate(booking.checkIn || booking.checkInDate);
      const end = parseUtcDate(booking.checkOut || booking.checkOutDate);

      if (!start || !end) return null;

      return {
        booking,
        start,
        end,
        guestName:
          booking.guest && typeof booking.guest === 'object'
            ? `${booking.guest.firstName || ''} ${booking.guest.lastName || ''}`.trim()
            : 'Guest'
      };
    })
    .filter(Boolean);
};

const buildVisibleSegments = (bookings, timelineStart) => {
  const timelineEnd = new Date(timelineStart);
  timelineEnd.setUTCDate(timelineStart.getUTCDate() + TIMELINE_DAYS);

  return bookings
    .map((item) => {
      const clippedStart = item.start > timelineStart ? item.start : timelineStart;
      const clippedEnd = item.end < timelineEnd ? item.end : timelineEnd;

      if (clippedEnd <= timelineStart || clippedStart >= timelineEnd || clippedEnd <= clippedStart) {
        return null;
      }

      const startOffsetDays = Math.floor((clippedStart - timelineStart) / 86400000);
      const endOffsetDays = Math.ceil((clippedEnd - timelineStart) / 86400000);
      const spanDays = Math.max(1, endOffsetDays - startOffsetDays);

      return {
        ...item,
        startOffsetDays,
        spanDays
      };
    })
    .filter(Boolean);
};

function RoomsTimelineView({ rooms, bookings, onViewBooking }) {
  const days = buildTimelineDays();
  const timelineStart = days[0];

  return (
    <section className="rooms-timeline-wrap">
      <div className="rooms-timeline-header">
        <div className="rooms-timeline-header-room">Room</div>
        <div className="rooms-timeline-header-days" style={{ '--timeline-days': TIMELINE_DAYS }}>
          {days.map((day) => (
            <div key={day.toISOString()} className="rooms-timeline-day-cell">
              {formatDayLabel(day)}
            </div>
          ))}
        </div>
      </div>

      <div className="rooms-timeline-body">
        {rooms.map((room) => {
          const roomBookings = getBookingsForRoom(bookings, room._id);
          const visibleSegments = buildVisibleSegments(roomBookings, timelineStart);

          return (
            <div key={room._id} className="rooms-timeline-row">
              <div className="rooms-timeline-room-cell">
                <strong>Room {room.roomNumber}</strong>
                <span>{room.type}</span>
                <small>{getOperationalLabel(room)}</small>
              </div>

              <div className="rooms-timeline-track" style={{ '--timeline-days': TIMELINE_DAYS }}>
                {visibleSegments.length === 0 && (
                  <div className="rooms-timeline-empty">No reservations in this range</div>
                )}

                {visibleSegments.map((segment) => (
                  <button
                    key={segment.booking._id}
                    type="button"
                    className={`timeline-booking-chip ${getBookingStatusClass(segment.booking.status)}`}
                    style={{
                      '--segment-start': segment.startOffsetDays,
                      '--segment-span': segment.spanDays
                    }}
                    onClick={() => onViewBooking(segment.booking)}
                    title={`${segment.guestName || 'Guest'} | ${segment.booking.status || 'Status unknown'}`}
                  >
                    <span>{segment.guestName || 'Guest'}</span>
                  </button>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}

export default RoomsTimelineView;
