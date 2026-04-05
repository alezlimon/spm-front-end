import { useState } from 'react';

export default function EditGuestForm({ guest, onSave, onCancel }) {
  const normalizeBirthDate = (value) => {
    if (!value) return '';
    const parsed = new Date(value);
    if (Number.isNaN(parsed.getTime())) return '';
    return parsed.toISOString().slice(0, 10);
  };

  const [form, setForm] = useState({
    firstName: guest.firstName || '',
    lastName: guest.lastName || '',
    email: guest.email || '',
    document: guest.document || '',
    birthDate: normalizeBirthDate(guest.birthDate)
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const isValidEmail = (email) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

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
      await onSave(form);
    } catch (err) {
      setError(err.message || 'Could not save guest');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form className="guest-edit-form" onSubmit={handleSubmit}>
      <h3 className="guest-edit-form-title">Edit Guest</h3>

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

      <div className="guest-edit-form-actions">
        <button className="primary-button" type="submit" disabled={loading}>
          {loading ? 'Saving...' : 'Save'}
        </button>

        <button className="secondary-button" type="button" onClick={onCancel}>
          Cancel
        </button>
      </div>

      {error && <p className="form-feedback form-feedback-error">{error}</p>}
    </form>
  );
}
