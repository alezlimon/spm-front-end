import { useState, useEffect } from 'react';
import { getAuthHeaders } from '../utils/auth';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5005/api';
const BREAKFAST_PRICE = 15;

const toInputDate = (date = new Date()) => {
  const d = new Date(date);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const calcNights = (checkIn, checkOut) => {
  if (!checkIn || !checkOut) return 0;
  const diff = new Date(checkOut) - new Date(checkIn);
  return Math.max(0, Math.round(diff / (1000 * 60 * 60 * 24)));
};

const EMPTY_GUEST = { firstName: '', lastName: '', email: '', document: '', birthDate: '', phone: '' };
const EMPTY_COMPANION = { firstName: '', lastName: '', document: '', birthDate: '', email: '', phone: '' };

export default function NewBookingModal({ propertyId, onClose, onCreated }) {
  const [step, setStep] = useState(1);

  // Step 1
  const [checkIn, setCheckIn] = useState(toInputDate());
  const [checkOut, setCheckOut] = useState('');
  const [rooms, setRooms] = useState([]);
  const [selectedRoom, setSelectedRoom] = useState(null);
  const [roomsLoading, setRoomsLoading] = useState(false);
  const [roomsError, setRoomsError] = useState('');

  // Step 2
  const [breakfast, setBreakfast] = useState(false);

  // Step 3
  const [guestTab, setGuestTab] = useState('new');
  const [guestSearch, setGuestSearch] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [selectedGuest, setSelectedGuest] = useState(null);
  const [newGuest, setNewGuest] = useState({ ...EMPTY_GUEST });
  const [hasCompanion, setHasCompanion] = useState(false);
  const [companion, setCompanion] = useState({ ...EMPTY_COMPANION });

  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');

  const nights = calcNights(checkIn, checkOut);
  const basePrice = selectedRoom ? selectedRoom.pricePerNight * nights : 0;
  const breakfastCost = breakfast ? BREAKFAST_PRICE * nights : 0;
  const total = basePrice + breakfastCost;

  // Lock body scroll
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = ''; };
  }, []);

  // Fetch available rooms when dates change
  useEffect(() => {
    if (!checkIn || !checkOut || nights <= 0) {
      setRooms([]);
      return;
    }
    const fetch_ = async () => {
      setRoomsLoading(true);
      setRoomsError('');
      setSelectedRoom(null);
      try {
        const res = await fetch(`${API_URL}/properties/${propertyId}/rooms`);
        if (!res.ok) throw new Error('Could not load rooms');
        const data = await res.json();
        setRooms((data || []).filter((r) => r.status === 'Available'));
      } catch (err) {
        setRoomsError(err.message || 'Error loading rooms');
      } finally {
        setRoomsLoading(false);
      }
    };
    fetch_();
  }, [checkIn, checkOut, propertyId, nights]);

  // Debounced guest search
  useEffect(() => {
    if (guestTab !== 'existing' || guestSearch.trim().length < 2) {
      setSearchResults([]);
      return;
    }
    const timer = setTimeout(async () => {
      try {
        const res = await fetch(`${API_URL}/guests/search?query=${encodeURIComponent(guestSearch)}`);
        if (!res.ok) return;
        const data = await res.json();
        setSearchResults(data || []);
      } catch {
        // ignore
      }
    }, 300);
    return () => clearTimeout(timer);
  }, [guestSearch, guestTab]);

  const canProceedStep1 = checkIn && checkOut && nights > 0 && selectedRoom !== null;

  const isValidEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  const validatePrimaryGuest = () => {
    const { firstName, lastName, email, document, birthDate } = newGuest;
    if (!firstName.trim()) return 'First name is required';
    if (!lastName.trim()) return 'Last name is required';
    if (!email.trim()) return 'Email is required';
    if (!isValidEmail(email)) return 'Invalid email format';
    if (!document.trim()) return 'ID / Passport is required';
    if (!birthDate) return 'Birth date is required';
    return null;
  };

  const validateCompanion = () => {
    const { firstName, lastName, document, birthDate } = companion;
    if (!firstName.trim()) return 'Companion first name is required';
    if (!lastName.trim()) return 'Companion last name is required';
    if (!document.trim()) return 'Companion ID / Passport is required';
    if (!birthDate) return 'Companion birth date is required';
    return null;
  };

  const parseErrorMessage = (status, data) => {
    if (status === 409) {
      return 'Guest already exists - will be reused for this reservation';
    }
    if (status === 401) {
      return 'Session expired - please log in again';
    }
    if (status === 400) {
      return data?.message || 'Invalid data provided';
    }
    return data?.message || 'Request failed';
  };

  const handleSubmit = async () => {
    setSubmitError('');

    if (guestTab === 'new') {
      const err = validatePrimaryGuest();
      if (err) { setSubmitError(err); return; }
    } else {
      if (!selectedGuest) { setSubmitError('Please select an existing guest'); return; }
    }

    if (hasCompanion) {
      const err = validateCompanion();
      if (err) { setSubmitError(err); return; }
    }

    setSubmitting(true);
    try {
      let guestId;

      if (guestTab === 'new') {
        const body = { ...newGuest };
        if (!body.phone) delete body.phone;
        const res = await fetch(`${API_URL}/guests`, {
          method: 'POST',
          headers: getAuthHeaders({ 'Content-Type': 'application/json' }),
          body: JSON.stringify(body),
        });

        let guestData;
        try {
          guestData = await res.json();
        } catch {
          throw new Error('Invalid response from server');
        }

        if (!res.ok) {
          throw new Error(parseErrorMessage(res.status, guestData));
        }
        guestId = guestData._id || guestData.guest?._id;
        if (!guestId) {
          throw new Error('Could not retrieve guest ID');
        }
      } else {
        guestId = selectedGuest._id;
      }

      if (hasCompanion) {
        const compBody = { ...companion };
        if (!compBody.email) delete compBody.email;
        if (!compBody.phone) delete compBody.phone;
        const compRes = await fetch(`${API_URL}/guests`, {
          method: 'POST',
          headers: getAuthHeaders({ 'Content-Type': 'application/json' }),
          body: JSON.stringify(compBody),
        });

        let compData;
        try {
          compData = await compRes.json();
        } catch {
          throw new Error('Invalid response from server while creating companion');
        }

        if (!compRes.ok) {
          throw new Error(`Companion: ${parseErrorMessage(compRes.status, compData)}`);
        }
      }

      const bookingRes = await fetch(`${API_URL}/bookings`, {
        method: 'POST',
        headers: getAuthHeaders({ 'Content-Type': 'application/json' }),
        body: JSON.stringify({
          room: selectedRoom._id,
          guest: guestId,
          checkIn,
          checkOut,
          status: 'confirmed',
          breakfastIncluded: breakfast,
          totalPrice: total,
        }),
      });

      let bookingData;
      try {
        bookingData = await bookingRes.json();
      } catch {
        throw new Error('Invalid response from server');
      }

      if (!bookingRes.ok) {
        throw new Error(parseErrorMessage(bookingRes.status, bookingData));
      }

      onCreated();
      onClose();
    } catch (err) {
      setSubmitError(err.message || 'Unexpected error');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-panel" onClick={(e) => e.stopPropagation()}>

        {/* Header */}
        <div className="modal-header">
          <div>
            <h2>New Reservation</h2>
            <div className="modal-steps">
              {['Dates & Room', 'Pricing', 'Guest'].map((label, i) => (
                <span
                  key={i}
                  className={`modal-step${step === i + 1 ? ' modal-step-active' : step > i + 1 ? ' modal-step-done' : ''}`}
                >
                  <span className="modal-step-num">{step > i + 1 ? '✓' : i + 1}</span>
                  {label}
                </span>
              ))}
            </div>
          </div>
          <button className="modal-close" onClick={onClose} type="button" aria-label="Close">✕</button>
        </div>

        {/* Step 1: Dates & Room */}
        {step === 1 && (
          <div className="modal-body">
            <div className="modal-date-row">
              <label className="modal-field">
                <span>Check-in</span>
                <input
                  type="date"
                  value={checkIn}
                  min={toInputDate()}
                  onChange={(e) => { setCheckIn(e.target.value); setSelectedRoom(null); }}
                />
              </label>
              <label className="modal-field">
                <span>Check-out</span>
                <input
                  type="date"
                  value={checkOut}
                  min={checkIn || toInputDate()}
                  onChange={(e) => { setCheckOut(e.target.value); setSelectedRoom(null); }}
                />
              </label>
              {nights > 0 && (
                <span className="modal-nights">{nights} night{nights !== 1 ? 's' : ''}</span>
              )}
            </div>

            {nights > 0 && (
              <div className="modal-rooms-section">
                <p className="modal-section-label">Select a room</p>
                {roomsLoading && <p className="page-feedback">Loading rooms...</p>}
                {roomsError && <p className="page-feedback page-feedback-error">{roomsError}</p>}
                {!roomsLoading && !roomsError && rooms.length === 0 && (
                  <p className="page-feedback">No available rooms for these dates.</p>
                )}
                <div className="modal-rooms-grid">
                  {rooms.map((room) => (
                    <button
                      key={room._id}
                      type="button"
                      className={`modal-room-card${selectedRoom?._id === room._id ? ' modal-room-card-selected' : ''}`}
                      onClick={() => setSelectedRoom(room)}
                    >
                      <span className="modal-room-number">Room {room.roomNumber}</span>
                      <span className="modal-room-type">{room.type}</span>
                      <span className="modal-room-price">€{room.pricePerNight} / night</span>
                      <span className="modal-room-total">€{room.pricePerNight * nights} total</span>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Step 2: Pricing */}
        {step === 2 && (
          <div className="modal-body">
            <div className="modal-pricing-summary">
              <div className="modal-pricing-row">
                <span>Room {selectedRoom.roomNumber} — {selectedRoom.type}</span>
                <span>€{selectedRoom.pricePerNight} × {nights} night{nights !== 1 ? 's' : ''}</span>
              </div>
              <div className="modal-pricing-row">
                <span>Base price</span>
                <strong>€{basePrice}</strong>
              </div>
            </div>

            <button
              type="button"
              className={`modal-breakfast-toggle${breakfast ? ' modal-breakfast-toggle-on' : ''}`}
              onClick={() => setBreakfast(!breakfast)}
            >
              <span className="modal-breakfast-icon">☕</span>
              <span className="modal-breakfast-label">
                <strong>Include breakfast</strong>
                <small>€{BREAKFAST_PRICE} per night</small>
              </span>
              <span className={`modal-breakfast-check${breakfast ? ' modal-breakfast-check-on' : ''}`}>
                {breakfast ? '✓' : '+'}
              </span>
            </button>

            {breakfast && (
              <div className="modal-pricing-row modal-pricing-breakfast">
                <span>Breakfast (€{BREAKFAST_PRICE} × {nights} night{nights !== 1 ? 's' : ''})</span>
                <span>+€{breakfastCost}</span>
              </div>
            )}

            <div className="modal-total-row">
              <span>Total</span>
              <strong>€{total}</strong>
            </div>
          </div>
        )}

        {/* Step 3: Guest */}
        {step === 3 && (
          <div className="modal-body">
            <div className="modal-guest-tabs">
              <button
                type="button"
                className={`modal-tab${guestTab === 'new' ? ' modal-tab-active' : ''}`}
                onClick={() => { setGuestTab('new'); setSelectedGuest(null); setGuestSearch(''); }}
              >
                New guest
              </button>
              <button
                type="button"
                className={`modal-tab${guestTab === 'existing' ? ' modal-tab-active' : ''}`}
                onClick={() => setGuestTab('existing')}
              >
                Existing guest
              </button>
            </div>

            {guestTab === 'existing' && (
              <div className="modal-guest-search">
                <input
                  className="modal-search-input"
                  placeholder="Search by name or email..."
                  value={guestSearch}
                  onChange={(e) => { setGuestSearch(e.target.value); setSelectedGuest(null); }}
                />
                {!selectedGuest && searchResults.length > 0 && (
                  <div className="modal-search-results">
                    {searchResults.map((g) => (
                      <button
                        key={g._id}
                        type="button"
                        className="modal-search-result-item"
                        onClick={() => { setSelectedGuest(g); setSearchResults([]); setGuestSearch(''); }}
                      >
                        <span>{g.firstName} {g.lastName}</span>
                        <small>{g.email}</small>
                      </button>
                    ))}
                  </div>
                )}
                {selectedGuest && (
                  <div className="modal-guest-selected">
                    <span>{selectedGuest.firstName} {selectedGuest.lastName}</span>
                    <small>{selectedGuest.email}</small>
                    <button
                      type="button"
                      className="modal-guest-clear"
                      onClick={() => { setSelectedGuest(null); setGuestSearch(''); }}
                    >✕</button>
                  </div>
                )}
              </div>
            )}

            {guestTab === 'new' && (
              <div className="modal-guest-form">
                <p className="modal-section-label">
                  Primary guest&nbsp;<span className="modal-required-note">* required fields</span>
                </p>
                <div className="modal-form-grid">
                  <label className="modal-field">
                    <span>First name *</span>
                    <input
                      value={newGuest.firstName}
                      placeholder="John"
                      onChange={(e) => setNewGuest({ ...newGuest, firstName: e.target.value })}
                    />
                  </label>
                  <label className="modal-field">
                    <span>Last name *</span>
                    <input
                      value={newGuest.lastName}
                      placeholder="Doe"
                      onChange={(e) => setNewGuest({ ...newGuest, lastName: e.target.value })}
                    />
                  </label>
                  <label className="modal-field">
                    <span>Email *</span>
                    <input
                      type="email"
                      value={newGuest.email}
                      placeholder="john@email.com"
                      onChange={(e) => setNewGuest({ ...newGuest, email: e.target.value })}
                    />
                  </label>
                  <label className="modal-field">
                    <span>ID / Passport *</span>
                    <input
                      value={newGuest.document}
                      placeholder="AB123456"
                      onChange={(e) => setNewGuest({ ...newGuest, document: e.target.value })}
                    />
                  </label>
                  <label className="modal-field">
                    <span>Birth date *</span>
                    <input
                      type="date"
                      value={newGuest.birthDate}
                      onChange={(e) => setNewGuest({ ...newGuest, birthDate: e.target.value })}
                    />
                  </label>
                  <label className="modal-field">
                    <span>Phone <small>(optional)</small></span>
                    <input
                      value={newGuest.phone}
                      placeholder="+34 600 000 000"
                      onChange={(e) => setNewGuest({ ...newGuest, phone: e.target.value })}
                    />
                  </label>
                </div>
              </div>
            )}

            <button
              type="button"
              className={`modal-companion-toggle${hasCompanion ? ' modal-companion-toggle-on' : ''}`}
              onClick={() => setHasCompanion(!hasCompanion)}
            >
              {hasCompanion ? '− Remove accompanying guest' : '+ Add accompanying guest'}
            </button>

            {hasCompanion && (
              <div className="modal-guest-form">
                <p className="modal-section-label">
                  Accompanying guest&nbsp;<span className="modal-required-note">* required fields</span>
                </p>
                <div className="modal-form-grid">
                  <label className="modal-field">
                    <span>First name *</span>
                    <input
                      value={companion.firstName}
                      placeholder="Jane"
                      onChange={(e) => setCompanion({ ...companion, firstName: e.target.value })}
                    />
                  </label>
                  <label className="modal-field">
                    <span>Last name *</span>
                    <input
                      value={companion.lastName}
                      placeholder="Doe"
                      onChange={(e) => setCompanion({ ...companion, lastName: e.target.value })}
                    />
                  </label>
                  <label className="modal-field">
                    <span>ID / Passport *</span>
                    <input
                      value={companion.document}
                      placeholder="AB123456"
                      onChange={(e) => setCompanion({ ...companion, document: e.target.value })}
                    />
                  </label>
                  <label className="modal-field">
                    <span>Birth date *</span>
                    <input
                      type="date"
                      value={companion.birthDate}
                      onChange={(e) => setCompanion({ ...companion, birthDate: e.target.value })}
                    />
                  </label>
                  <label className="modal-field">
                    <span>Email <small>(optional)</small></span>
                    <input
                      type="email"
                      value={companion.email}
                      placeholder="jane@email.com"
                      onChange={(e) => setCompanion({ ...companion, email: e.target.value })}
                    />
                  </label>
                  <label className="modal-field">
                    <span>Phone <small>(optional)</small></span>
                    <input
                      value={companion.phone}
                      placeholder="+34 600 000 000"
                      onChange={(e) => setCompanion({ ...companion, phone: e.target.value })}
                    />
                  </label>
                </div>
              </div>
            )}

            {submitError && (
              <p className="page-feedback page-feedback-error">{submitError}</p>
            )}
          </div>
        )}

        {/* Footer */}
        <div className="modal-footer">
          {step > 1 ? (
            <button type="button" className="secondary-button" onClick={() => setStep(step - 1)}>
              Back
            </button>
          ) : (
            <button type="button" className="secondary-button" onClick={onClose}>
              Cancel
            </button>
          )}
          <div style={{ flex: 1 }} />
          {step < 3 && (
            <button
              type="button"
              className="primary-button"
              onClick={() => setStep(step + 1)}
              disabled={step === 1 && !canProceedStep1}
            >
              Next
            </button>
          )}
          {step === 3 && (
            <button
              type="button"
              className="primary-button"
              onClick={handleSubmit}
              disabled={submitting}
            >
              {submitting ? 'Creating...' : 'Create Reservation'}
            </button>
          )}
        </div>

      </div>
    </div>
  );
}
