import { useState } from 'react';
import { assignGuestToBooking } from '../api/bookingsApi';
import GuestSelector from './GuestSelector';

export default function AssignGuestToBooking({ bookingId, onSuccess }) {
  const [guestId, setGuestId] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleGuestChange = (selectedGuestId) => {
    setGuestId(selectedGuestId);

    if (error) setError('');
    if (success) setSuccess(false);
  };

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
    <form className="guest-form-card" onSubmit={handleAssign}>
      <div className="guest-form-header">
        <h3 style={{ margin: 0 }}>Assign guest to booking</h3>
      </div>

      <GuestSelector value={guestId} onChange={handleGuestChange} />

      <button type="submit" className="primary-button" disabled={loading || !guestId || success}>
        {loading ? 'Assigning...' : 'Assign Guest'}
      </button>

      {error && <p className="form-feedback form-feedback-error">{error}</p>}
      {success && <p className="form-feedback form-feedback-success">Guest assigned successfully!</p>}
    </form>
  );
}
