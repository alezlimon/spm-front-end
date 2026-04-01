import '../App.css';
import BookingsTable from './BookingsTable';

export default function BookingsPage() {
  return (
    <div className="app">
      <header className="header">
        <h1>Bookings</h1>
        <p>Reservations, arrivals, and room assignment in one streamlined view.</p>
      </header>

      <BookingsTable />
    </div>
  );
}