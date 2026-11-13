const $ = (s, r = document) => r.querySelector(s);
const el = (t, c, h) => {
  const e = document.createElement(t);
  if (c) e.className = c;
  if (h != null) e.textContent = h;
  return e;
};
const clamp = (x, a = 0, b = 100) => Math.max(a, Math.min(b, x));
const nf = (x, d = 0) =>
  Number(x).toLocaleString("es", {
    minimumFractionDigits: d,
    maximumFractionDigits: d,
  });
