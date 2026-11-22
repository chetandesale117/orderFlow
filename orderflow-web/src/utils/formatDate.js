import { format, parseISO } from 'date-fns';

export function formatDate(dateString, pattern = 'MMM d, yyyy') {
  if (!dateString) return '—';
  try {
    const date = typeof dateString === 'string' ? parseISO(dateString) : dateString;
    return format(date, pattern);
  } catch (e) {
    return String(dateString);
  }
}

export function formatDateTime(dateString) {
  return formatDate(dateString, 'MMM d, yyyy h:mm a');
}
