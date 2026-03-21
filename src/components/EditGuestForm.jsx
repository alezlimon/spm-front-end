import { useState } from 'react';

export default function EditGuestForm({ guest, onSave, onCancel }) {
  const [form, setForm] = useState({
    firstName: guest.firstName || '',
    lastName: guest.lastName || '',
    email: guest.email || '',
    document: guest.document || '',
    birthDate: guest.birthDate || ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      await onSave(form);
    } catch (err) {
      setError('No se pudo guardar el huésped');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} style={{background:'#fff',borderRadius:12,padding:16,marginBottom:16}}>
      <h3 style={{margin:'0 0 8px'}}>Edit guest</h3>
      <input name="firstName" placeholder="First name" value={form.firstName} onChange={handleChange} required style={{padding:8,marginBottom:8,width:'100%'}} />
      <input name="lastName" placeholder="Last name" value={form.lastName} onChange={handleChange} required style={{padding:8,marginBottom:8,width:'100%'}} />
      <input name="email" placeholder="Email" value={form.email} onChange={handleChange} required style={{padding:8,marginBottom:8,width:'100%'}} />
      <input name="document" placeholder="Passport / ID" value={form.document} onChange={handleChange} required style={{padding:8,marginBottom:8,width:'100%'}} />
      <input name="birthDate" type="date" placeholder="Birth date" value={form.birthDate} onChange={handleChange} required style={{padding:8,marginBottom:8,width:'100%'}} />
      <div style={{display:'flex',gap:8}}>
        <button type="submit" disabled={loading} style={{background:'#059669',color:'#fff',border:'none',borderRadius:8,padding:8,fontWeight:600}}>
          {loading ? 'Saving...' : 'Save'}
        </button>
        <button type="button" onClick={onCancel} style={{background:'#d1d5db',color:'#111',border:'none',borderRadius:8,padding:8}}>Cancel</button>
      </div>
      {error && <p style={{color:'#b91c1c',margin:0}}>{error}</p>}
    </form>
  );
}
