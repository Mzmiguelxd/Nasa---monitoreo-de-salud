const ecg = { buf: [], ph: 0, last: 0 };
function wave(p) {
  const g = (c, a, w) => a * Math.exp(-((p - c) ** 2) / (2 * w * w));
  return (
    g(0.18, 0.12, 0.025) +
    g(0.355, -0.14, 0.008) +
    g(0.38, 1, 0.011) +
    g(0.405, -0.22, 0.009) +
    g(0.62, 0.26, 0.04)
  );
}
function drawEcg(ts) {
  const cv = $("#ecg");
  if (!cv) return;
  const w = cv.clientWidth,
    h = cv.clientHeight;
  if (w) {
    const dpr = window.devicePixelRatio || 1;
    if (cv.width !== Math.round(w * dpr)) {
      cv.width = Math.round(w * dpr);
      cv.height = Math.round(h * dpr);
    }
    const dt = Math.min(0.05, (ts - ecg.last) / 1000 || 0);
    ecg.last = ts;
    const n = Math.max(1, Math.round((dt * w) / 3));
    for (let i = 0; i < n; i++) {
      ecg.ph += ((dt / n) * S.v.hr) / 60;
      ecg.buf.push(wave(ecg.ph % 1));
    }
    while (ecg.buf.length > w) ecg.buf.shift();
    const c = cv.getContext("2d");
    c.setTransform(dpr, 0, 0, dpr, 0, 0);
    c.clearRect(0, 0, w, h);
    c.strokeStyle = getComputedStyle(document.documentElement)
      .getPropertyValue("--accent")
      .trim();
    c.lineWidth = 1.8;
    c.lineJoin = "round";
    c.beginPath();
    const off = w - ecg.buf.length;
    ecg.buf.forEach((y, i) => {
      const yy = h * 0.78 - y * h * 0.62;
      i ? c.lineTo(off + i, yy) : c.moveTo(off + i, yy);
    });
    c.stroke();
  }
  if (!matchMedia("(prefers-reduced-motion: reduce)").matches)
    requestAnimationFrame(drawEcg);
}
