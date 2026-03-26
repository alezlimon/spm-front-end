import { useEffect, useState } from 'react';
import NewGuestForm from './NewGuestForm';
import GuestList from './GuestList';
import '../App.css';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5005/api';

export default function GuestsPage() {
  const [guests, setGuests] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const fetchGuests = async (query = '') => {
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
      setGuests(data);
    } catch (err) {
      setError('Could not load guests');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGuests();
  }, []);

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