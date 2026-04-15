export const fmtCurrency = (n: number) => `$${Math.round(n || 0).toLocaleString()}`;

export const clamp = (n: number, min = 0, max = 100) =>
  Math.min(max, Math.max(min, n));
