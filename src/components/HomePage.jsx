
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
        if (!roomsRes.ok || !guestsRes.ok) throw new Error('Error fetching data');
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

  // Stats
  const totalRooms = rooms.length;
  const availableRooms = rooms.filter(r => r.status === 'Available').length;
  const occupiedRooms = rooms.filter(r => r.status === 'Occupied').length;
  const dirtyRooms = rooms.filter(r => r.status === 'Dirty').length;
  const maintenanceRooms = rooms.filter(r => r.status === 'Maintenance').length;
  const occupancyRate = totalRooms === 0 ? 0 : Math.round((occupiedRooms / totalRooms) * 100);

  let statusMsg = '';
  if (dirtyRooms >= 2) {
    statusMsg = 'Priority: Multiple rooms need cleaning!';
  } else if (maintenanceRooms >= 1) {
    statusMsg = 'Attention: At least one room is under maintenance.';
  } else if (occupancyRate >= 80) {
    statusMsg = 'High occupancy detected. Keep room turnover efficient!';
  } else {
    statusMsg = 'Operations are stable.';
  }

  return (
    <div className="home-dashboard">
      <header className="header">
        <h1>Welcome to Hotel CRM</h1>
        <p>Manage guests, rooms, and bookings efficiently.</p>
      </header>
      <section className="overview-section" style={{maxWidth:900,margin:'0 auto 32px',padding:'16px 0'}}>
        {loading ? (
          <p style={{color:'#6b7280'}}>Loading overview...</p>
        ) : error ? (
          <p style={{color:'#b91c1c'}}>{error}</p>
        ) : (
          <div style={{display:'flex',gap:32,flexWrap:'wrap',justifyContent:'center',alignItems:'center'}}>
            <div style={{minWidth:180,background:'#fff',borderRadius:12,boxShadow:'0 2px 8px #eee',padding:24,display:'flex',flexDirection:'column',alignItems:'center'}}>
              <span style={{fontSize:'2.2em',fontWeight:700,color:'#2563eb'}}>{occupancyRate}%</span>
              <span style={{color:'#6b7280'}}>Occupancy</span>
            </div>
            <div style={{display:'flex',gap:16}}>
              <div style={{background:'#f1f5f9',borderRadius:8,padding:'12px 18px',textAlign:'center'}}>
                <div style={{fontWeight:600,color:'#0ea5e9'}}>{totalRooms}</div>
                <div style={{fontSize:13,color:'#64748b'}}>Rooms</div>
              </div>
              <div style={{background:'#f1f5f9',borderRadius:8,padding:'12px 18px',textAlign:'center'}}>
                <div style={{fontWeight:600,color:'#22c55e'}}>{availableRooms}</div>
                <div style={{fontSize:13,color:'#64748b'}}>Available</div>
              </div>
              <div style={{background:'#f1f5f9',borderRadius:8,padding:'12px 18px',textAlign:'center'}}>
                <div style={{fontWeight:600,color:'#f59e42'}}>{occupiedRooms}</div>
                <div style={{fontSize:13,color:'#64748b'}}>Occupied</div>
              </div>
              <div style={{background:'#f1f5f9',borderRadius:8,padding:'12px 18px',textAlign:'center'}}>
                <div style={{fontWeight:600,color:'#eab308'}}>{dirtyRooms}</div>
                <div style={{fontSize:13,color:'#64748b'}}>Dirty</div>
              </div>
              <div style={{background:'#f1f5f9',borderRadius:8,padding:'12px 18px',textAlign:'center'}}>
                <div style={{fontWeight:600,color:'#a21caf'}}>{maintenanceRooms}</div>
                <div style={{fontSize:13,color:'#64748b'}}>Maintenance</div>
              </div>
            </div>
            <div style={{minWidth:180,background:'#f9fafb',borderRadius:12,padding:24,display:'flex',flexDirection:'column',alignItems:'center',boxShadow:'0 2px 8px #eee'}}>
              <span style={{fontSize:'2em',fontWeight:600,color:'#0ea5e9'}}>{guests.length}</span>
              <span style={{color:'#6b7280'}}>Guests</span>
            </div>
            <div style={{minWidth:220,background:'#f1f5f9',borderRadius:12,padding:24,display:'flex',flexDirection:'column',alignItems:'center',boxShadow:'0 2px 8px #eee'}}>
              <span style={{fontWeight:600,fontSize:'1.1em',color:'#b91c1c'}}>{statusMsg}</span>
            </div>
          </div>
        )}
      </section>
      <div className="dashboard-links">
        <Link to="/guests" className="dashboard-card">
          <h2>Guests</h2>
          <p>View and manage all guests</p>
        </Link>
        <Link to="/rooms" className="dashboard-card">
          <h2>Rooms</h2>
          <p>Check room status and bookings</p>
        </Link>
        <Link to="/bookings" className="dashboard-card">
          <h2>Bookings</h2>
          <p>Manage reservations and check-ins</p>
        </Link>
      </div>
    </div>
  );
}
