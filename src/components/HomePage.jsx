import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import '../App.css';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5005/api';

export default function HomePage() {
  const [rooms, setRooms] = useState([]);
  const [guests, setGuests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      setError('');

      try {
        const [roomsRes, guestsRes] = await Promise.all([
          fetch(`${API_URL}/rooms`),
          fetch(`${API_URL}/guests`)
        ]);

        if (!roomsRes.ok || !guestsRes.ok) {
          throw new Error('Error fetching data');
        }

        const roomsData = await roomsRes.json();
        const guestsData = await guestsRes.json();

        setRooms(roomsData);
        setGuests(guestsData);
      } catch (err) {
        setError('Could not load overview data');
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, []);

  const totalRooms = rooms.length;
  const availableRooms = rooms.filter((room) => room.status === 'Available').length;
  const occupiedRooms = rooms.filter((room) => room.status === 'Occupied').length;
  const dirtyRooms = rooms.filter((room) => room.status === 'Dirty').length;
  const maintenanceRooms = rooms.filter((room) => room.status === 'Maintenance').length;
  const occupancyRate =
    totalRooms === 0 ? 0 : Math.round((occupiedRooms / totalRooms) * 100);

  let statusMsg = 'Operations are stable.';
  let operationalNote = 'No urgent operational blockers detected.';
  let alertClass = 'alert-low';

  if (dirtyRooms >= 2) {
    statusMsg = 'Priority: Multiple rooms need cleaning.';
    operationalNote = 'Cleaning coordination should be the first focus right now.';
    alertClass = 'alert-medium';
  } else if (maintenanceRooms >= 1) {
    statusMsg = 'Attention: At least one room is under maintenance.';
    operationalNote = 'Monitor room availability closely before assigning new bookings.';
    alertClass = 'alert-medium';
  } else if (occupancyRate >= 80) {
    statusMsg = 'High occupancy detected. Keep room turnover efficient.';
    operationalNote = 'Fast check-out, cleaning, and reassignment flow will matter most.';
    alertClass = 'alert-high';
  }

  return (
    <div className="app">
      <header className="header">
        <h1>StayFlow</h1>
        <p>Hotel operations software for guests, rooms, and bookings in one clear workflow.</p>
      </header>

      {loading ? (
        <p className="page-feedback">Loading overview...</p>
      ) : error ? (
        <p className="page-feedback page-feedback-error">{error}</p>
      ) : (
        <>
          <section className={`assistant ${alertClass}`}>
            <h3>Operations Overview</h3>
            <p>{statusMsg}</p>
            <p className="assistant-suggestion">{operationalNote}</p>
          </section>

          <section className="summary-grid">
            <div className="summary-card">
              <h3>Occupancy</h3>
              <p>{occupancyRate}%</p>
            </div>

            <div className="summary-card">
              <h3>Rooms</h3>
              <p>{totalRooms}</p>
            </div>

            <div className="summary-card">
              <h3>Available</h3>
              <p>{availableRooms}</p>
            </div>

            <div className="summary-card">
              <h3>Occupied</h3>
              <p>{occupiedRooms}</p>
            </div>

            <div className="summary-card">
              <h3>Dirty</h3>
              <p>{dirtyRooms}</p>
            </div>

            <div className="summary-card">
              <h3>Maintenance</h3>
              <p>{maintenanceRooms}</p>
            </div>

            <div className="summary-card">
              <h3>Guests</h3>
              <p>{guests.length}</p>
            </div>
          </section>

          <section className="assistant alert-low">
            <h3>Quick Access</h3>
            <div className="quick-access-links">
              <Link to="/guests" className="quick-access-link">
                <span>Open guest profiles</span>
                <span>→</span>
              </Link>

              <Link to="/rooms" className="quick-access-link">
                <span>Review room status and turnover</span>
                <span>→</span>
              </Link>

              <Link to="/bookings" className="quick-access-link">
                <span>Open booking workflow</span>
                <span>→</span>
              </Link>
            </div>
          </section>
        </>
      )}
    </div>
  );
}