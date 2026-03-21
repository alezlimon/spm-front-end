import AssignGuestToBooking from './AssignGuestToBooking';

// Example bookingId for demonstration
const exampleBookingId = 'REPLACE_WITH_A_REAL_BOOKING_ID';

export default function BookingDetailPage() {
  return (
    <div style={{ maxWidth: 600, margin: '40px auto', padding: 24 }}>
      <h1 style={{ fontSize: '2rem', marginBottom: 24 }}>Booking Detail</h1>
      {/* Other booking details would go here */}
      <AssignGuestToBooking bookingId={exampleBookingId} />
    </div>
  );
}
