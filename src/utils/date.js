export const toInputDate = (dateValue = new Date()) => {
  const date = new Date(dateValue);

  if (Number.isNaN(date.getTime())) {
    return '';
  }

  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');

  return `${year}-${month}-${day}`;
};

export const formatDisplayDate = (dateValue, fallback = '—') => {
  if (!dateValue) {
    return fallback;
  }

  const date = new Date(dateValue);

  if (Number.isNaN(date.getTime())) {
    return fallback;
  }

  return date.toLocaleDateString();
};