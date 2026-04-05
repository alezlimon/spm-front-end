const normalizeBookingStatus = (status) => (status || '').trim().toLowerCase();

export const canCheckIn = (status) => {
  const normalizedStatus = normalizeBookingStatus(status);
  return normalizedStatus === 'confirmed';
};

export const canCheckOut = (status) => {
  const normalizedStatus = normalizeBookingStatus(status);
  return normalizedStatus === 'checked-in';
};