export function formatOrderNumber(orderNumber) {
  if (!orderNumber) return '—';
  return orderNumber.toUpperCase();
}
