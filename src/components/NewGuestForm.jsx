import { useState } from 'react'

function NewGuestForm({ onGuestCreated }) {
  const [form, setForm] = useState({
    firstName: '',
    lastName: '',
    email: '',
    document: ''
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value })
    setError('')
    setSuccess(false)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    setSuccess(false)
    try {
      const res = await fetch('http://localhost:5005/api/guests', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form)
      })
      if (!res.ok) throw new Error('Error creating guest')
      setSuccess(true)
      setForm({ firstName: '', lastName: '', email: '', document: '' })
      if (onGuestCreated) onGuestCreated()
    } catch (err) {
      setError('Could not create guest')
    } finally {
      setLoading(false)
    }
  }

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
        placeholder="First Name"
        value={form.firstName}
        onChange={handleChange}
        required
        style={{padding: 8, borderRadius: 8, border: '1px solid #d1d5db'}}
      />
      <input
        name="lastName"
        placeholder="Last Name"
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
        placeholder="Passport / DNI"
        value={form.document}
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
