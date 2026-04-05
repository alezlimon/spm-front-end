import { useEffect, useState } from 'react';
import { listGuests } from '../api/guestsApi';
import { ErrorState, LoadingState } from './PageState';

export default function GuestSelector({ value, onChange }) {
  const [guests, setGuests] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');

  useEffect(() => {
    const fetchGuests = async () => {
      setLoading(true);
      setError('');

      try {
        const data = await listGuests(search);
        setGuests(data || []);
      } catch (err) {
        setError(err.message || 'Could not load guests');
        setGuests([]);
      } finally {
        setLoading(false);
      }
    };

    fetchGuests();
  }, [search]);

  return (
    <div style={{marginBottom:16}}>
      <label style={{fontWeight:600,marginBottom:4,display:'block'}}>Select guest</label>
      <input
        type="text"
        placeholder="Search guest by name or document..."
        value={search}
        onChange={e => setSearch(e.target.value)}
        style={{width:'100%',padding:8,borderRadius:8,border:'1px solid #d1d5db',marginBottom:8}}
      />
      <select
        value={value || ''}
        onChange={e => onChange(e.target.value)}
        style={{width:'100%',padding:8,borderRadius:8,border:'1px solid #d1d5db'}}
      >
        <option value="">Select a guest...</option>
        {guests.map(g => (
          <option key={g._id} value={g._id}>
            {g.firstName} {g.lastName} ({g.document})
          </option>
        ))}
      </select>
      {loading && <LoadingState message="Loading guests..." />}
      {!loading && <ErrorState message={error} />}
    </div>
  );
}
