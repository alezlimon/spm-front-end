

import '../App.css';
import BookingsTable from './BookingsTable';

export default function BookingsPage() {
  return (
    <div className="app">
      <header className="header">
        <h1>Bookings</h1>
        <p>Track reservations, check-in flow, and upcoming room activity from one place.</p>
      </header>
      <BookingsTable />
    </div>
  );
}
