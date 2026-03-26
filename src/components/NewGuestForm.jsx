import { useState } from 'react';
import '../App.css';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5005/api';

function NewGuestForm({ onGuestCreated }) {
  const [form, setForm] = useState({
    firstName: '',
    lastName: '',
    email: '',
    document: '',
    birthDate: ''
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setError('');
    setSuccess(false);
  };

  const isValidEmail = (email) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess(false);

    if (
      !form.firstName.trim() ||
      !form.lastName.trim() ||
      !form.email.trim() ||
      !form.document.trim() ||
      !form.birthDate
    ) {
      setError('All fields are required');
      return;
    }

    if (!isValidEmail(form.email)) {
      setError('Invalid email format');
      return;
    }

    setLoading(true);

    try {
      const res = await fetch(`${API_URL}/guests`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form)
      });

      if (!res.ok) {
        let msg = 'Could not create guest';

        try {
          const data = await res.json();
          if (data && data.message) msg = data.message;
        } catch {
          // ignore JSON parsing error
        }

        throw new Error(msg);
      }

      setSuccess(true);
      setForm({
        firstName: '',
        lastName: '',
        email: '',
        document: '',
        birthDate: ''
      });

      if (onGuestCreated) onGuestCreated();
    } catch (err) {
      setError(err.message || 'Could not create guest');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form className="guest-form-card" onSubmit={handleSubmit}>
      <div className="guest-form-header">
        <h2>New Guest</h2>
        <p>Create a guest profile for bookings, check-in, and room assignment.</p>
      </div>

      <div className="guest-form-grid">
        <input
          name="firstName"
          placeholder="First name"
          value={form.firstName}
          onChange={handleChange}
          required
        />

        <input
          name="lastName"
          placeholder="Last name"
          value={form.lastName}
          onChange={handleChange}
          required
        />

        <input
          name="email"
          type="email"
          placeholder="Email"
          value={form.email}
          onChange={handleChange}
          required
        />

        <input
          name="document"
          placeholder="Passport / ID"
          value={form.document}
          onChange={handleChange}
          required
        />

        <input
          name="birthDate"
          type="date"
          value={form.birthDate}
          onChange={handleChange}
          required
        />
      </div>

      <button className="primary-button" type="submit" disabled={loading}>
        {loading ? 'Saving...' : 'Add Guest'}
      </button>

      {error && <p className="form-feedback form-feedback-error">{error}</p>}
      {success && <p className="form-feedback form-feedback-success">Guest created.</p>}
    </form>
  );
}

export default NewGuestForm;