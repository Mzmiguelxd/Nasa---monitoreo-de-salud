function model(adh, shel, storm) {
  const bone = [],
    dose = [];
  let b = 100,
    c = 0;
  for (let d = 0; d <= S.total; d += 10) {
    if (d <= S.day) {
      b = 100 - ((100 - S.v.bone) * d) / S.day;
      c = (S.v.cum * d) / S.day;
    } else {
      b -= (1.5 * (1 - (0.78 * adh) / 100) * 10) / 30;
      c += 1.1 * (1 - (0.3 * (shel - 8)) / 8) * 10;
    }
    bone.push([d, b]);
    dose.push([
      d,
      c + (d > S.day ? (storm * 25 * (d - S.day)) / (S.total - S.day) : 0),
    ]);
  }
  return { bone, dose };
}
function chart(cv, mine, plan, o) {
  const dpr = window.devicePixelRatio || 1,
    w = cv.clientWidth,
    h = cv.clientHeight;
  if (!w) return;
  cv.width = w * dpr;
  cv.height = h * dpr;
  const c = cv.getContext("2d");
  c.scale(dpr, dpr);
  const cs = getComputedStyle(document.documentElement),
    col = (n) => cs.getPropertyValue(n).trim();
  const L = 40,
    Rt = 12,
    T = 10,
    B = 24,
    X = (d) => L + (d / S.total) * (w - L - Rt),
    Y = (y) => T + (1 - (y - o.min) / (o.max - o.min)) * (h - T - B);
  c.font = "12px Barlow, sans-serif";
  c.fillStyle = col("--mute");
  c.strokeStyle = col("--line");
  c.lineWidth = 1;
  for (let i = 0; i <= 4; i++) {
    const y = o.min + ((o.max - o.min) * i) / 4;
    c.beginPath();
    c.moveTo(L, Y(y));
    c.lineTo(w - Rt, Y(y));
    c.stroke();
    c.textAlign = "right";
    c.fillText(nf(y), L - 6, Y(y) + 4);
  }
  c.textAlign = "center";
  [0, 130, 260, 390, 520].forEach((d) => c.fillText("D" + d, X(d), h - 6));
  c.setLineDash([2, 3]);
  c.beginPath();
  c.moveTo(X(S.day), T);
  c.lineTo(X(S.day), h - B);
  c.stroke();
  c.textAlign = "left";
  c.fillText("Hoy", X(S.day) + 5, T + 12);
  c.setLineDash([6, 4]);
  c.strokeStyle = col("--bad");
  c.lineWidth = 1.5;
  c.beginPath();
  c.moveTo(L, Y(o.lim));
  c.lineTo(w - Rt, Y(o.lim));
  c.stroke();
  c.fillStyle = col("--bad");
  c.fillText(o.label, L + 6, Y(o.lim) - 6);
  const line = (pts, color, dash, lw) => {
    c.setLineDash(dash);
    c.strokeStyle = color;
    c.lineWidth = lw;
    c.beginPath();
    pts.forEach(([d, y], i) =>
      i ? c.lineTo(X(d), Y(y)) : c.moveTo(X(d), Y(y)),
    );
    c.stroke();
  };
  line(plan, col("--mute"), [5, 4], 2);
  line(mine, col("--accent"), [], 2.6);
  c.setLineDash([]);
}
function project() {
  const p = S.proj;
  $("#oAdh").textContent = p.adh + " %";
  $("#oShel").textContent = p.shel + " h";
  $("#oStorm").textContent = p.storm;
  const m = model(p.adh, p.shel, p.storm),
    pl = model(80, 8, 1);
  chart($("#chBone"), m.bone, pl.bone, {
    min: 80,
    max: 100,
    lim: 90,
    label: "Vigilancia de fractura",
  });
  chart($("#chDose"), m.dose, pl.dose, {
    min: 0,
    max: 800,
    lim: 600,
    label: "Límite de carrera",
  });
  const b = m.bone.at(-1)[1],
    d = m.dose.at(-1)[1];
  $("#verdict").textContent =
    "Con este ajuste vuelves con " +
    nf(b, 1) +
    " % de tu densidad ósea y " +
    nf(d) +
    " mSv acumulados, el " +
    nf(d / 6) +
    " % del límite de carrera. " +
    (b < 90
      ? "El hueso cruza el umbral de vigilancia: sube el ejercicio. "
      : "El hueso se mantiene sobre el umbral. ") +
    (d > 600
      ? "La radiación supera el límite: necesitas más horas blindado."
      : "La radiación queda dentro del límite.");
}
