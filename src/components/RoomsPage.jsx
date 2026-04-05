import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { listAllBookings } from '../api/bookingsApi';
import { listPropertyRooms } from '../api/propertiesApi';
import { listRooms, updateRoom } from '../api/roomsApi';
import BookingDetailPage from './BookingDetailPage';
import { EmptyState, ErrorState, LoadingState } from './PageState';
import RoomCard from './RoomCard';
import RoomsTimelineView from './RoomsTimelineView';
import '../App.css';

export default function RoomsPage() {
  const { propertyId } = useParams();
  const [rooms, setRooms] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [viewMode, setViewMode] = useState('timeline');
  const [selectedBookingId, setSelectedBookingId] = useState(null);
  const [filter, setFilter] = useState('All');
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError('');

      try {
        const [roomsData, bookingsData] = await Promise.all([
          propertyId ? listPropertyRooms(propertyId) : listRooms(),
          listAllBookings()
        ]);

        setRooms(roomsData);
        setBookings(bookingsData);
      } catch {
        setError('Could not load rooms');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [propertyId]);

  const updateRoomStatus = async (roomId, newStatus, extraPayload = {}) => {
    const payload = { status: newStatus, ...extraPayload };

    try {
      const updatedRoom = await updateRoom(roomId, payload);

      setRooms((prevRooms) =>
        prevRooms.map((room) =>
          room._id === roomId ? { ...room, ...payload, ...updatedRoom } : room
        )
      );
    } catch (err) {
      console.error(err);
    }
  };

  const getCurrentBookingForRoom = (roomId) => {
    const roomBookings = bookings.filter((booking) => {
      if (!booking.room) return false;

      const bookingRoomId =
        typeof booking.room === 'string' ? booking.room : booking.room._id;

      return bookingRoomId === roomId;
    });

    if (roomBookings.length === 0) return null;

    const activeStatuses = ['confirmed', 'checked-in'];

    const prioritizedBooking =
      roomBookings.find((booking) =>
        booking.status ? activeStatuses.includes(booking.status.toLowerCase()) : false
      ) || roomBookings[0];

    return prioritizedBooking;
  };

  const totalRooms = rooms.length;
  const occupiedRooms = rooms.filter((room) => room.status === 'Occupied').length;
  const maintenanceRooms = rooms.filter((room) => room.status === 'Maintenance').length;
  const readyRooms = rooms.filter(
    (room) => room.status === 'Available' && room.isClean
  ).length;

  const getOperationalState = (room) => {
    if (room.status === 'Maintenance') return 'Out of Service';
    if (room.status === 'Occupied') return 'Occupied';
    if (room.status === 'Available' && room.isClean) return 'Ready';
    return 'Dirty';
  };

  const dirtyRooms = rooms.filter(
    (room) => getOperationalState(room) === 'Dirty'
  ).length;

  const filterOptions = [
    { key: 'All', label: 'All', count: totalRooms },
    { key: 'Ready', label: 'Ready', count: readyRooms },
    { key: 'Dirty', label: 'Dirty', count: dirtyRooms },
    { key: 'Occupied', label: 'Occupied', count: occupiedRooms },
    { key: 'Out of Service', label: 'Out of Service', count: maintenanceRooms }
  ];

  const getRoomSortScore = (room) => {
    const operationalState = getOperationalState(room);
    if (operationalState === 'Dirty') return 0;
    if (operationalState === 'Ready') return 1;
    if (operationalState === 'Occupied') return 2;
    return 3;
  };

  const filteredRooms = rooms
    .filter((room) => {
      if (filter === 'All') return true;
      return getOperationalState(room) === filter;
    })
    .filter((room) => {
      const searchValue = searchTerm.toLowerCase();
      const operationalState = getOperationalState(room).toLowerCase();

      return (
        room.roomNumber.toLowerCase().includes(searchValue) ||
        room.type.toLowerCase().includes(searchValue) ||
        room.status.toLowerCase().includes(searchValue) ||
        operationalState.includes(searchValue)
      );
    });

  const sortedRooms = [...filteredRooms].sort((a, b) => {
    const scoreA = getRoomSortScore(a);
    const scoreB = getRoomSortScore(b);

    if (scoreA !== scoreB) {
      return scoreA - scoreB;
    }

    const roomNumberA = Number.parseInt(String(a.roomNumber), 10);
    const roomNumberB = Number.parseInt(String(b.roomNumber), 10);

    if (!Number.isNaN(roomNumberA) && !Number.isNaN(roomNumberB)) {
      return roomNumberA - roomNumberB;
    }

    return String(a.roomNumber).localeCompare(String(b.roomNumber));
  });

  return (
    <div className="app">
      <header className="header">
        <h1>Rooms</h1>
        <p>Run front desk operations fast: know what is ready, blocked, occupied, or out of service.</p>
        <div className="rooms-view-toggle" role="tablist" aria-label="Rooms view mode">
          <button
            type="button"
            className={viewMode === 'timeline' ? 'active' : ''}
            onClick={() => setViewMode('timeline')}
          >
            Timeline
          </button>
          <button
            type="button"
            className={viewMode === 'cards' ? 'active' : ''}
            onClick={() => setViewMode('cards')}
          >
            Cards
          </button>
        </div>
      </header>

      <div className="rooms-layout">
        <section className="rooms-toolbar">
          <div className="rooms-kpi-strip">
            <div className="summary-card">
              <h3>Total Rooms</h3>
              <p>{totalRooms}</p>
            </div>

            <div className="summary-card" onClick={() => setFilter('Ready')}>
              <h3>Ready</h3>
              <p>{readyRooms}</p>
            </div>

            <div className="summary-card" onClick={() => setFilter('Dirty')}>
              <h3>Dirty</h3>
              <p>{dirtyRooms}</p>
            </div>

            <div className="summary-card" onClick={() => setFilter('Occupied')}>
              <h3>Occupied</h3>
              <p>{occupiedRooms}</p>
            </div>

            <div className="summary-card" onClick={() => setFilter('Out of Service')}>
              <h3>Out of Service</h3>
              <p>{maintenanceRooms}</p>
            </div>
          </div>

          <div className="rooms-controls">
            <div>
              <h3 className="rooms-section-title">Operational Filters</h3>
              <div className="rooms-filter-pills" role="tablist" aria-label="Room operational filters">
                {filterOptions.map((option) => (
                  <button
                    key={option.key}
                    type="button"
                    className={`rooms-filter-pill rooms-filter-pill-${option.key.toLowerCase().replace(/\s+/g, '-')} ${filter === option.key ? 'active' : ''}`}
                    onClick={() => setFilter(option.key)}
                  >
                    <span>{option.label}</span>
                    <strong>{option.count}</strong>
                  </button>
                ))}
              </div>
            </div>

            <div>
              <h3 className="rooms-section-title">Search</h3>
              <div className="search-bar">
                <input
                  type="text"
                  placeholder="Search by room number, type, or status"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>
          </div>
        </section>

        <section>
          {loading && <LoadingState message="Loading rooms..." />}
          {!loading && <ErrorState message={error} />}

          {!loading && !error && filteredRooms.length === 0 && (
            <EmptyState message="No rooms match the current filters." />
          )}

          {!loading && !error && filteredRooms.length > 0 && viewMode === 'cards' && (
            <div className="rooms-grid">
              {sortedRooms.map((room) => (
                <RoomCard
                  key={room._id}
                  room={room}
                  currentBooking={getCurrentBookingForRoom(room._id)}
                  updateRoomStatus={updateRoomStatus}
                />
              ))}
            </div>
          )}

          {!loading && !error && filteredRooms.length > 0 && viewMode === 'timeline' && (
            <RoomsTimelineView
              rooms={sortedRooms}
              bookings={bookings}
              onViewBooking={(booking) => setSelectedBookingId(booking._id)}
            />
          )}
        </section>
      </div>

      {selectedBookingId && (
        <BookingDetailPage
          bookingId={selectedBookingId}
          onClose={() => setSelectedBookingId(null)}
          onUpdated={() => {
            setSelectedBookingId(null);
          }}
        />
      )}
    </div>
  );
}