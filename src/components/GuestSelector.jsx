import { useEffect, useState } from 'react';
import { listGuests } from '../api/guestsApi';
import { ErrorState, LoadingState } from './PageState';

const MIN_SEARCH_LENGTH = 2;

export default function GuestSelector({ value, onChange }) {
  const [guests, setGuests] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [hint, setHint] = useState(`Type at least ${MIN_SEARCH_LENGTH} characters to search.`);

  useEffect(() => {
    const query = search.trim();

    if (!query) {
      setGuests([]);
      setError('');
      setLoading(false);
      setHint(`Type at least ${MIN_SEARCH_LENGTH} characters to search.`);
      return;
    }

    if (query.length < MIN_SEARCH_LENGTH) {
      setGuests([]);
      setError('');
      setLoading(false);
      setHint(`Type at least ${MIN_SEARCH_LENGTH} characters to search.`);
      return;
    }

    const fetchGuests = async () => {
      setLoading(true);
      setError('');
      setHint('');

      try {
        const data = await listGuests(query);
        const safeGuests = Array.isArray(data) ? data.slice(0, 15) : [];
        setGuests(safeGuests);

        if (safeGuests.length === 0) {
          setHint('No guests found. Try a different search term.');
        }
      } catch (err) {
        setError(err.message || 'Could not load guests');
        setGuests([]);
      } finally {
        setLoading(false);
      }
    };

    const timer = setTimeout(() => {
      fetchGuests();
    }, 250);

    return () => clearTimeout(timer);
  }, [search]);

  return (
    <div className="guest-form-grid" style={{ marginBottom: 12 }}>
      <label className="modal-field" style={{ display: 'grid', gap: '6px' }}>
        <span>Select guest</span>
        <input
          type="text"
          placeholder="Search guest by name or document..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </label>

      <label className="modal-field" style={{ display: 'grid', gap: '6px' }}>
        <span>Matches</span>
        <select
          value={value || ''}
          onChange={(e) => onChange(e.target.value)}
          disabled={loading || guests.length === 0}
        >
          <option value="">Select a guest...</option>
          {guests.map((g) => (
            <option key={g._id} value={g._id}>
              {g.firstName} {g.lastName} ({g.document})
            </option>
          ))}
        </select>
      </label>

      {loading && <LoadingState message="Loading guests..." />}
      {!loading && <ErrorState message={error} />}
      {!loading && !error && hint && (
        <p className="form-feedback">{hint}</p>
      )}
    </div>
  );
}
