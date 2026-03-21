import { useEffect, useState } from 'react';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5005/api';

export default function GuestSelector({ value, onChange }) {
  const [guests, setGuests] = useState([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');

  useEffect(() => {
    const fetchGuests = async () => {
      setLoading(true);
      const url = search
        ? `${API_URL}/guests/search?query=${encodeURIComponent(search)}`
        : `${API_URL}/guests`;
      const res = await fetch(url);
      const data = await res.json();
      setGuests(data);
      setLoading(false);
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
      {loading && <p style={{color:'#6b7280'}}>Loading guests...</p>}
    </div>
  );
}
