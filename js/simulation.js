function tick() {
  const t = targets(),
    v = S.v;
  for (const k in BASE)
    v[k] += (t[k] - v[k]) * 0.2 + (Math.random() - 0.5) * NOISE[k];
  if (v.dose > 3) v.cum += v.dose / 144;
  VIT.forEach((d) => {
    const h = S.h[d.k];
    h.push(v[d.k]);
    if (h.length > 40) h.shift();
  });
  render();
}
