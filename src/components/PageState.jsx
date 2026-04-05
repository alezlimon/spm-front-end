export function LoadingState({ message = 'Loading...' }) {
  return <p className="page-feedback">{message}</p>;
}

export function ErrorState({ message }) {
  if (!message) {
    return null;
  }

  return <p className="page-feedback page-feedback-error">{message}</p>;
}

export function EmptyState({ message = 'No data available.' }) {
  return <p className="page-feedback">{message}</p>;
}