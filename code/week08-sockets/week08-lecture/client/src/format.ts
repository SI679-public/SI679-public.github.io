// Small display helpers. Nothing here talks to the server.

const dollars = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD'
});

export const money = (amount: number): string => dollars.format(amount);

export const dateTime = (iso: string): string =>
  new Date(iso).toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit'
  });

// A CSS background for a product's color dot. "Silver/Black" becomes a
// two-tone dot; anything the browser doesn't know as a color shows grey.
export const swatch = (color: string): string => {
  const known = color
    .toLowerCase()
    .split(/\/| and |,/)
    .map((part) => part.trim().replace('stainless steel', 'silver'))
    .filter((part) => CSS.supports('color', part));
  if (known.length === 0) {
    return 'lightgrey';
  }
  if (known.length === 1) {
    return known[0];
  }
  return `linear-gradient(135deg, ${known[0]} 50%, ${known[1]} 50%)`;
};
