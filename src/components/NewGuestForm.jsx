import { useState } from 'react'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5005/api';

function NewGuestForm({ onGuestCreated }) {
  const [form, setForm] = useState({
    firstName: '',
    lastName: '',
    email: '',
    document: '',
    birthDate: ''
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value })
    setError('')
    setSuccess(false)
  }

  // Validación simple de email
  const isValidEmail = (email) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess(false);

    // Validación previa
    if (!form.firstName.trim() || !form.lastName.trim() || !form.email.trim() || !form.document.trim() || !form.birthDate) {
      setError("All fields are required");
      return;
    }
    if (!isValidEmail(form.email)) {
      setError("Invalid email format");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/guests`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (!res.ok) {
        let msg = "Could not create guest";
        try {
          const data = await res.json();
          if (data && data.message) msg = data.message;
        } catch {}
        throw new Error(msg);
      }
      setSuccess(true);
      setForm({ firstName: "", lastName: "", email: "", document: "", birthDate: "" });
      if (onGuestCreated) onGuestCreated();
    } catch (err) {
      setError(err.message || "Could not create guest");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} style={{
      background: '#fff',
      borderRadius: 12,
      boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
      padding: 16,
      marginBottom: 24,
      maxWidth: 400,
      marginLeft: 'auto',
      marginRight: 'auto',
      display: 'flex',
      flexDirection: 'column',
      gap: 10
    }}>
      <h2 style={{margin: '0 0 8px', fontSize: '1.1rem', color: '#6b7280'}}>Add New Guest</h2>
      <input
        name="firstName"
        placeholder="First name"
        value={form.firstName}
        onChange={handleChange}
        required
        style={{padding: 8, borderRadius: 8, border: '1px solid #d1d5db'}}
      />
      <input
        name="lastName"
        placeholder="Last name"
        value={form.lastName}
        onChange={handleChange}
        required
        style={{padding: 8, borderRadius: 8, border: '1px solid #d1d5db'}}
      />
      <input
        name="email"
        type="email"
        placeholder="Email"
        value={form.email}
        onChange={handleChange}
        required
        style={{padding: 8, borderRadius: 8, border: '1px solid #d1d5db'}}
      />
      <input
        name="document"
        placeholder="Passport / ID"
        value={form.document}
        onChange={handleChange}
        required
        style={{padding: 8, borderRadius: 8, border: '1px solid #d1d5db'}}
      />
      <input
        name="birthDate"
        type="date"
        placeholder="Birth date"
        value={form.birthDate}
        onChange={handleChange}
        required
        style={{padding: 8, borderRadius: 8, border: '1px solid #d1d5db'}}
      />
      <button
        type="submit"
        disabled={loading}
        style={{
          background: '#111827', color: 'white', border: 'none', borderRadius: 8, padding: 10, marginTop: 8, cursor: 'pointer', fontWeight: 600
        }}
      >
        {loading ? 'Saving...' : 'Add Guest'}
      </button>
      {error && <p style={{color: '#b91c1c', margin: 0}}>{error}</p>}
      {success && <p style={{color: '#059669', margin: 0}}>Guest created!</p>}
    </form>
  )
}

export default NewGuestForm
