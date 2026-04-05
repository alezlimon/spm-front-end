import { useEffect, useRef, useState } from 'react';
import { useParams } from 'react-router-dom';
import { listAllBookings } from '../api/bookingsApi';
import { listGuests } from '../api/guestsApi';
import { listPropertyRooms } from '../api/propertiesApi';
import { ErrorState, LoadingState } from './PageState';
import NewGuestForm from './NewGuestForm';
import GuestList from './GuestList';
import '../App.css';

const getEntityId = (value) => {
  if (!value) return null;
  if (typeof value === 'string') return value;
  return value._id || value.id || null;
};

const filterScopedGuests = (guestList, guestIds) => {
  if (!Array.isArray(guestIds)) {
    return guestList;
  }

  const allowedGuestIds = new Set(guestIds);
  return guestList.filter((guest) => allowedGuestIds.has(guest._id));
};

export default function GuestsPage() {
  const { propertyId } = useParams();
  const [guests, setGuests] = useState([]);
  const [search, setSearch] = useState('');
  const [scopedGuestIds, setScopedGuestIds] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const searchDebounceRef = useRef(null);

  const fetchGuests = async (query = '', overrideGuestIds = scopedGuestIds) => {
    setLoading(true);
    setError('');

    try {
      const data = await listGuests(query);
      const safeData = data || [];

      setGuests(
        !propertyId || !Array.isArray(overrideGuestIds)
          ? safeData
          : filterScopedGuests(safeData, overrideGuestIds)
      );
    } catch {
      setError('Could not load guests');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const loadScope = async () => {
      if (!propertyId) {
        setScopedGuestIds(null);
        setLoading(true);
        setError('');

        try {
          const guestData = await listGuests('');
          setGuests(guestData || []);
        } catch {
          setGuests([]);
          setError('Could not load guests');
        } finally {
          setLoading(false);
        }

        return;
      }

      try {
        const [roomsData, bookingsData] = await Promise.all([
          listPropertyRooms(propertyId),
          listAllBookings()
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
        const guestData = await listGuests('');
        setGuests(filterScopedGuests(guestData || [], guestIds));
      } catch {
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

    if (searchDebounceRef.current) {
      clearTimeout(searchDebounceRef.current);
    }

    searchDebounceRef.current = setTimeout(() => {
      fetchGuests(value);
    }, 300);
  };

  useEffect(() => {
    return () => {
      if (searchDebounceRef.current) {
        clearTimeout(searchDebounceRef.current);
      }
    };
  }, []);

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

          {loading && <LoadingState message="Loading guests..." />}
          {!loading && <ErrorState message={error} />}

          {!loading && !error && (
            <GuestList guests={guests} onGuestUpdated={() => fetchGuests(search)} />
          )}
        </div>
      </section>
    </div>
  );
}