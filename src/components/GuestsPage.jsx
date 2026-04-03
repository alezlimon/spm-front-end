import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import NewGuestForm from './NewGuestForm';
import GuestList from './GuestList';
import '../App.css';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5005/api';

const getEntityId = (value) => {
  if (!value) return null;
  if (typeof value === 'string') return value;
  return value._id || value.id || null;
};

export default function GuestsPage() {
  const { propertyId } = useParams();
  const [guests, setGuests] = useState([]);
  const [search, setSearch] = useState('');
  const [scopedGuestIds, setScopedGuestIds] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const fetchGuests = async (query = '', overrideGuestIds = scopedGuestIds) => {
    setLoading(true);
    setError('');

    try {
      const url = query
        ? `${API_URL}/guests/search?query=${encodeURIComponent(query)}`
        : `${API_URL}/guests`;

      const res = await fetch(url);

      if (!res.ok) {
        throw new Error('Error fetching guests');
      }

      const data = await res.json();
      const safeData = data || [];

      if (!propertyId || !Array.isArray(overrideGuestIds)) {
        setGuests(safeData);
        return;
      }

      const allowedGuestIds = new Set(overrideGuestIds);
      setGuests(safeData.filter((guest) => allowedGuestIds.has(guest._id)));
    } catch (err) {
      setError('Could not load guests');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const loadScope = async () => {
      if (!propertyId) {
        setScopedGuestIds(null);
        fetchGuests('', null);
        return;
      }

      try {
        const [roomsRes, bookingsRes] = await Promise.all([
          fetch(`${API_URL}/properties/${propertyId}/rooms`),
          fetch(`${API_URL}/bookings`)
        ]);

        if (!roomsRes.ok || !bookingsRes.ok) {
          throw new Error('Error building guest scope');
        }

        const [roomsData, bookingsData] = await Promise.all([
          roomsRes.json(),
          bookingsRes.json()
        ]);

        const roomIds = new Set((roomsData || []).map((room) => room._id));
        const guestIds = (bookingsData || [])
          .filter((booking) => {
            const bookingRoomId = getEntityId(booking.room) || getEntityId(booking.roomId);
            return bookingRoomId ? roomIds.has(bookingRoomId) : false;
          })
          .map((booking) => getEntityId(booking.guest) || getEntityId(booking.guestId))
          .filter(Boolean);

        setScopedGuestIds(guestIds);
        fetchGuests('', guestIds);
      } catch (err) {
        setScopedGuestIds([]);
        setGuests([]);
        setError('Could not load guests');
      }
    };

    loadScope();
  }, [propertyId]);

  const handleSearch = (e) => {
    const value = e.target.value;
    setSearch(value);
    fetchGuests(value);
  };

  const handleGuestCreated = () => {
    fetchGuests(search);
  };

  return (
    <div className="app">
      <header className="header">
        <h1>Guests</h1>
        <p>Register, search, and update guest profiles in one clean workflow.</p>
      </header>

      <section className="guests-page-layout">
        <div className="guests-form-column">
          <NewGuestForm onGuestCreated={handleGuestCreated} />
        </div>

        <div className="guests-list-column">
          <div className="search-bar guests-search-bar">
            <input
              type="text"
              placeholder="Search by name or document"
              value={search}
              onChange={handleSearch}
            />
          </div>

          {loading && <p className="page-feedback">Loading guests...</p>}
          {error && <p className="page-feedback page-feedback-error">{error}</p>}

          {!loading && !error && (
            <GuestList guests={guests} onGuestUpdated={() => fetchGuests(search)} />
          )}
        </div>
      </section>
    </div>
  );
}