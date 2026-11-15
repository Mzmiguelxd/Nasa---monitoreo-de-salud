const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];
const el = (t, c, h) => {
  const e = document.createElement(t);
  if (c) e.className = c;
  if (h != null) e.textContent = h;
  return e;
};
const clamp = (x, a = 0, b = 100) => Math.max(a, Math.min(b, x));
const nf = (x, d = 0) =>
  Number(x).toLocaleString("es", { minimumFractionDigits: d, maximumFractionDigits: d });
const css = (n) => getComputedStyle(document.documentElement).getPropertyValue(n).trim();
const ahora = () => {
  const d = new Date();
  return String(d.getHours()).padStart(2, "0") + ":" + String(d.getMinutes()).padStart(2, "0");
};
const semilla = (s) => () => {
  s = (s * 1664525 + 1013904223) % 4294967296;
  return s / 4294967296;
};
function toast(t) {
  const e = $("#toast");
  e.textContent = t;
  e.classList.add("on");
  clearTimeout(toast.t);
  toast.t = setTimeout(() => e.classList.remove("on"), 2200);
}
