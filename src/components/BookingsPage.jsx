import '../App.css';

export default function BookingsPage() {
  return (
    <div className="app">
      <header className="header">
        <h1>Bookings</h1>
        <p>Track reservations, check-in flow, and upcoming room activity from one place.</p>
      </header>

      <section className="assistant alert-low">
        <h3>Booking Overview</h3>
        <p>The booking workflow is still in progress.</p>
        <p className="assistant-suggestion">
          This section will become the central place for reservations, arrivals, departures, and room assignment.
        </p>
      </section>

      <section className="summary-grid">
        <div className="summary-card">
          <h3>Reservations</h3>
          <p>—</p>
        </div>

        <div className="summary-card">
          <h3>Arrivals</h3>
          <p>—</p>
        </div>

        <div className="summary-card">
          <h3>Departures</h3>
          <p>—</p>
        </div>

        <div className="summary-card">
          <h3>Check-Ins</h3>
          <p>—</p>
        </div>
      </section>

      <section className="summary-card">
        <h3>Coming Next</h3>
        <p style={{ fontSize: '0.98rem', lineHeight: '1.6', letterSpacing: '0', fontWeight: '400' }}>
          Booking creation, guest assignment, room linking, and a more complete daily operations flow will be added here next.
        </p>
      </section>
    </div>
  );
}