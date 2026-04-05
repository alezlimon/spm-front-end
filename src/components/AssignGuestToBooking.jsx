import { useState } from 'react';
import { assignGuestToBooking } from '../api/bookingsApi';
import GuestSelector from './GuestSelector';

export default function AssignGuestToBooking({ bookingId, onSuccess }) {
  const [guestId, setGuestId] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleAssign = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess(false);
    try {
      await assignGuestToBooking(bookingId, { guestId });
      setSuccess(true);
      if (onSuccess) onSuccess();
    } catch (err) {
      setError(err.message || 'Could not assign guest');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleAssign} style={{background:'#fff',borderRadius:12,padding:16,marginBottom:16}}>
      <h3 style={{margin:'0 0 8px'}}>Assign guest to booking</h3>
      <GuestSelector value={guestId} onChange={setGuestId} />
      <button type="submit" disabled={loading || !guestId} style={{background:'#111827',color:'#fff',border:'none',borderRadius:8,padding:10,fontWeight:600}}>
        {loading ? 'Assigning...' : 'Assign Guest'}
      </button>
      {error && <p style={{color:'#b91c1c',margin:0}}>{error}</p>}
      {success && <p style={{color:'#059669',margin:0}}>Guest assigned successfully!</p>}
    </form>
  );
}
