export function formatPrice(amount) {
  return `₹${amount.toLocaleString('en-IN')}`;
}

export function timeAgo(daysAgo) {
  if (daysAgo === 0) return 'Today';
  if (daysAgo === 1) return 'Yesterday';
  if (daysAgo < 7) return `${daysAgo} days ago`;
  if (daysAgo < 30) return `${Math.floor(daysAgo / 7)} week${Math.floor(daysAgo / 7) > 1 ? 's' : ''} ago`;
  return `${Math.floor(daysAgo / 30)} month${Math.floor(daysAgo / 30) > 1 ? 's' : ''} ago`;
}

export function daysFromNowLabel(days) {
  if (days === 0) return 'Today';
  if (days === 1) return 'Tomorrow';
  return `In ${days} days`;
}

export function safeParseJSON(raw) {
  try {
    const cleaned = raw.replace(/```json|```/g, '').trim();
    return JSON.parse(cleaned);
  } catch {
    return null;
  }
}

export function generateOrderId() {
  return `ORD-${Date.now().toString(36).toUpperCase()}`;
}

export function randomDeliveryMins(base = 14) {
  return base + Math.floor(Math.random() * 4);
}
