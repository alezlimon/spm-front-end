
import { useState } from 'react';
import EditGuestForm from './EditGuestForm';

export default function GuestList({ guests, onGuestUpdated }) {
  const [editingId, setEditingId] = useState(null);

  if (!guests.length) return <p style={{color:'#6b7280'}}>No guests found.</p>;

  const handleEdit = (id) => setEditingId(id);
  const handleCancel = () => setEditingId(null);

  const handleSave = async (id, updatedData) => {
    const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5005/api';
    const res = await fetch(`${API_URL}/guests/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updatedData)
    });
    if (!res.ok) throw new Error('No se pudo actualizar el huésped');
    setEditingId(null);
    if (onGuestUpdated) onGuestUpdated();
  };

  return (
    <ul style={{marginTop: 24, padding: 0, listStyle: 'none'}}>
      {guests.map(guest => (
        <li key={guest._id} style={{background:'#fff',borderRadius:8,padding:12,marginBottom:10,boxShadow:'0 1px 4px #eee'}}>
          {editingId === guest._id ? (
            <EditGuestForm
              guest={guest}
              onSave={async (data) => handleSave(guest._id, data)}
              onCancel={handleCancel}
            />
          ) : (
            <>
              <strong>{guest.firstName} {guest.lastName}</strong><br/>
              <span style={{color:'#6b7280'}}>Document: {guest.document}</span><br/>
              <span style={{color:'#6b7280'}}>Birth date: {guest.birthDate ? new Date(guest.birthDate).toLocaleDateString() : '-'}</span><br/>
              <button onClick={() => handleEdit(guest._id)} style={{marginTop:8,background:'#111827',color:'#fff',border:'none',borderRadius:6,padding:'4px 12px',fontSize:'0.95em',cursor:'pointer'}}>Edit</button>
            </>
          )}
        </li>
      ))}
    </ul>
  );
}
