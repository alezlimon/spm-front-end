import { useState } from 'react';
import EditGuestForm from './EditGuestForm';
import '../App.css';
import { getAuthHeaders } from '../utils/auth';

export default function GuestList({ guests, onGuestUpdated }) {
  const [editingId, setEditingId] = useState(null);

  if (!guests.length) {
    return <p className="page-feedback">No guests found.</p>;
  }

  const handleEdit = (id) => setEditingId(id);
  const handleCancel = () => setEditingId(null);

  const handleSave = async (id, updatedData) => {
    const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5005/api';

    const res = await fetch(`${API_URL}/guests/${id}`, {
      method: 'PUT',
      headers: getAuthHeaders({ 'Content-Type': 'application/json' }),
      body: JSON.stringify(updatedData)
    });

    if (!res.ok) {
      throw new Error('Could not update guest');
    }

    setEditingId(null);

    if (onGuestUpdated) {
      onGuestUpdated();
    }
  };

  return (
    <div className="guest-list">
      {guests.map((guest) => (
        <div key={guest._id} className="guest-card">
          {editingId === guest._id ? (
            <EditGuestForm
              guest={guest}
              onSave={async (data) => handleSave(guest._id, data)}
              onCancel={handleCancel}
            />
          ) : (
            <>
              <div className="guest-card-header">
                <h3>
                  {guest.firstName} {guest.lastName}
                </h3>
                <button
                  className="secondary-button"
                  onClick={() => handleEdit(guest._id)}
                >
                  Edit
                </button>
              </div>

              <div className="guest-card-details">
                <p>
                  <span>Email</span>
                  {guest.email || '-'}
                </p>
                <p>
                  <span>Document</span>
                  {guest.document || '-'}
                </p>
                <p>
                  <span>Birth date</span>
                  {guest.birthDate
                    ? new Date(guest.birthDate).toLocaleDateString()
                    : '-'}
                </p>
              </div>
            </>
          )}
        </div>
      ))}
    </div>
  );
}