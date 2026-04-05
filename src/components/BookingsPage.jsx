import { useState } from 'react';
import { useParams } from 'react-router-dom';
import '../App.css';
import BookingDetailPage from './BookingDetailPage';
import BookingsTable from './BookingsTable';
import NewBookingModal from './NewBookingModal';

export default function BookingsPage() {
  const { propertyId } = useParams();
  const [showModal, setShowModal] = useState(false);
  const [selectedBookingId, setSelectedBookingId] = useState(null);
  const [refreshKey, setRefreshKey] = useState(0);

  return (
    <div className="app">
      <header className="header bookings-page-header-row">
        <div>
          <h1>Bookings</h1>
          <p>Reservations, arrivals, and room assignment in one streamlined view.</p>
        </div>
        <button
          type="button"
          className="primary-button"
          onClick={() => setShowModal(true)}
        >
          <svg
            width="13"
            height="13"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            aria-hidden="true"
            style={{ marginRight: '7px' }}
          >
            <path d="M12 5V19M5 12H19" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" />
          </svg>
          New reservation
        </button>
      </header>

      <BookingsTable
        refreshKey={refreshKey}
        onViewBooking={(booking) => setSelectedBookingId(booking._id)}
      />

      {showModal && (
        <NewBookingModal
          propertyId={propertyId}
          onClose={() => setShowModal(false)}
          onCreated={() => setRefreshKey((k) => k + 1)}
        />
      )}

      {selectedBookingId && (
        <BookingDetailPage
          bookingId={selectedBookingId}
          onClose={() => setSelectedBookingId(null)}
          onUpdated={() => {
            setRefreshKey((k) => k + 1);
          }}
        />
      )}
    </div>
  );
}