import { useState, useEffect } from 'react';
import RoomCard from './RoomCard';
import '../App.css';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5005/api';

export default function RoomsPage() {
  const [rooms, setRooms] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [filter, setFilter] = useState('All');
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError('');

      try {
        const [roomsRes, bookingsRes] = await Promise.all([
          fetch(`${API_URL}/rooms`),
          fetch(`${API_URL}/bookings`)
        ]);

        if (!roomsRes.ok || !bookingsRes.ok) {
          throw new Error('Error fetching room data');
        }

        const roomsData = await roomsRes.json();
        const bookingsData = await bookingsRes.json();

        setRooms(roomsData);
        setBookings(bookingsData);
      } catch (err) {
        setError('Could not load rooms');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const getStatusClass = (status) => {
    if (status === 'Available') return 'status-available';
    if (status === 'Occupied') return 'status-occupied';
    if (status === 'Maintenance') return 'status-maintenance';
    if (status === 'Dirty') return 'status-dirty';
    return '';
  };

  const updateRoomStatus = async (roomId, newStatus) => {
    try {
      const res = await fetch(`${API_URL}/rooms/${roomId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ status: newStatus })
      });

      if (!res.ok) {
        throw new Error('Could not update room');
      }

      const updatedRoom = await res.json();

      setRooms((prevRooms) =>
        prevRooms.map((room) =>
          room._id === updatedRoom._id ? updatedRoom : room
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
  const availableRooms = rooms.filter((room) => room.status === 'Available').length;
  const occupiedRooms = rooms.filter((room) => room.status === 'Occupied').length;
  const dirtyRooms = rooms.filter((room) => room.status === 'Dirty').length;
  const maintenanceRooms = rooms.filter((room) => room.status === 'Maintenance').length;

  const occupancyRate =
    totalRooms === 0 ? 0 : Math.round((occupiedRooms / totalRooms) * 100);

  const getPriorityAlert = () => {
    if (dirtyRooms >= 2) {
      return 'Priority alert: multiple rooms need cleaning.';
    }

    if (maintenanceRooms >= 1) {
      return 'Attention: at least one room is under maintenance.';
    }

    if (occupancyRate >= 80) {
      return 'High occupancy detected. Room turnover should stay efficient.';
    }

    return 'Operations are stable right now.';
  };

  const generateSummary = () => {
    if (rooms.length === 0) return 'No room data available yet.';

    return `Occupancy is at ${occupancyRate}%. You have ${availableRooms} available, ${occupiedRooms} occupied, ${dirtyRooms} dirty, and ${maintenanceRooms} in maintenance.`;
  };

  const getAssistantClass = () => {
    if (dirtyRooms >= 2) return 'assistant alert-high';
    if (occupancyRate >= 80) return 'assistant alert-medium';
    return 'assistant alert-low';
  };

  const getCleaningSuggestion = () => {
    const dirtyRoomList = rooms.filter((room) => room.status === 'Dirty');

    if (dirtyRoomList.length === 0) {
      return 'No cleaning suggestion right now.';
    }

    return `Suggested action: clean Room ${dirtyRoomList[0].roomNumber} first.`;
  };

  const filteredRooms = rooms
    .filter((room) => {
      if (filter === 'All') return true;
      return room.status === filter;
    })
    .filter((room) => {
      const searchValue = searchTerm.toLowerCase();

      return (
        room.roomNumber.toLowerCase().includes(searchValue) ||
        room.type.toLowerCase().includes(searchValue) ||
        room.status.toLowerCase().includes(searchValue)
      );
    });

  return (
    <div className="app">
      <header className="header">
        <h1>Rooms</h1>
        <p>Monitor room status, room turnover, and operational priorities from one dashboard.</p>
      </header>

      <div className="rooms-layout">
        <section className="rooms-top-grid">
          <div className={getAssistantClass()}>
            <h3>Operations Assistant</h3>
            <p>{generateSummary()}</p>
            <p className="assistant-alert">{getPriorityAlert()}</p>
            <p className="assistant-suggestion">{getCleaningSuggestion()}</p>
          </div>

          <div className="rooms-kpi-grid">
            <div className="summary-card" onClick={() => setFilter('All')}>
              <h3>Total Rooms</h3>
              <p>{totalRooms}</p>
            </div>

            <div className="summary-card" onClick={() => setFilter('Available')}>
              <h3>Available</h3>
              <p>{availableRooms}</p>
            </div>

            <div className="summary-card" onClick={() => setFilter('Occupied')}>
              <h3>Occupied</h3>
              <p>{occupiedRooms}</p>
            </div>

            <div className="summary-card" onClick={() => setFilter('Maintenance')}>
              <h3>Maintenance</h3>
              <p>{maintenanceRooms}</p>
            </div>

            <div className="summary-card" onClick={() => setFilter('Dirty')}>
              <h3>Dirty</h3>
              <p>{dirtyRooms}</p>
            </div>
          </div>
        </section>

        <section className="rooms-controls">
          <div>
            <h3 className="rooms-section-title">Filters</h3>
            <div className="filter-bar">
              <button onClick={() => setFilter('All')}>All</button>
              <button onClick={() => setFilter('Available')}>Available</button>
              <button onClick={() => setFilter('Occupied')}>Occupied</button>
              <button onClick={() => setFilter('Maintenance')}>Maintenance</button>
              <button onClick={() => setFilter('Dirty')}>Dirty</button>
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
        </section>

        <section>
          {loading && <p className="page-feedback">Loading rooms...</p>}
          {error && <p className="page-feedback page-feedback-error">{error}</p>}

          {!loading && !error && filteredRooms.length === 0 && (
            <p className="page-feedback">No rooms found.</p>
          )}

          {!loading && !error && filteredRooms.length > 0 && (
            <div className="rooms-grid">
              {filteredRooms.map((room) => (
                <RoomCard
                  key={room._id}
                  room={room}
                  currentBooking={getCurrentBookingForRoom(room._id)}
                  getStatusClass={getStatusClass}
                  updateRoomStatus={updateRoomStatus}
                />
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}