
import { useEffect, useState } from 'react';
import NewGuestForm from './NewGuestForm';
import GuestList from './GuestList';

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
      if (!res.ok) throw new Error('Error fetching guests');
      const data = await res.json();
      setGuests(data);
    } catch (err) {
      setError('No se pudieron cargar los huéspedes');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGuests();
  }, []);

  const handleSearch = (e) => {
    setSearch(e.target.value);
    fetchGuests(e.target.value);
  };

  const handleGuestCreated = () => {
    fetchGuests(search);
  };

  return (
    <div style={{ maxWidth: 600, margin: '40px auto', padding: 24 }}>
      <h1 style={{ fontSize: '2rem', marginBottom: 24 }}>Gestión de Huéspedes</h1>
      <NewGuestForm onGuestCreated={handleGuestCreated} />
      <input
        type="text"
        placeholder="Buscar por nombre o documento..."
        value={search}
        onChange={handleSearch}
        style={{width:'100%',padding:8,borderRadius:8,border:'1px solid #d1d5db',margin:'16px 0'}}
      />
      {loading && <p style={{color:'#6b7280'}}>Cargando huéspedes...</p>}
      {error && <p style={{color:'#b91c1c'}}>{error}</p>}
      <GuestList guests={guests} onGuestUpdated={() => fetchGuests(search)} />
    </div>
  );
}
