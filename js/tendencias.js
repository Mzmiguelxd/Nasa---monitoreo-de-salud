const TREND_KEYS = ["sueno", "fc", "pas", "glu", "spo2", "temp", "vfc", "reac", "animo", "estres", "ejer", "dosis", "osea"];
let trendSel = "sueno";

function construirTendencias() {
  const box = $("#trendPick");
  for (const k of TREND_KEYS) {
    const b = el("button", "chipbtn", IND[k].n);
    b.type = "button";
    b.dataset.k = k;
    b.onclick = () => {
      trendSel = k;
      pintarTendencias();
    };
    box.append(b);
  }
  $("#adh").value = S.proj.adh;
  $("#ref").value = S.proj.ref;
  $("#tor").value = S.proj.tor;
  ["adh", "ref", "tor"].forEach(
    (i) =>
      ($("#" + i).oninput = () => {
        S.proj = { adh: +$("#adh").value, ref: +$("#ref").value, tor: +$("#tor").value };
        disco.guardar();
        proyectar();
      })
  );
}

function lienzo(cv) {
  const dpr = window.devicePixelRatio || 1,
    w = cv.clientWidth,
    h = cv.clientHeight;
  if (!w) return null;
  cv.width = w * dpr;
  cv.height = h * dpr;
  const c = cv.getContext("2d");
  c.scale(dpr, dpr);
  c.font = "12px Barlow, system-ui, sans-serif";
  return { c, w, h };
}

function pintarTendencias() {
  $$("#trendPick button").forEach((b) => b.setAttribute("aria-pressed", b.dataset.k === trendSel ? "true" : "false"));
  const k = trendSel,
    d = IND[k],
    s = serie(k),
    dias = HIST.dias;
  const L = lienzo($("#chTrend"));
  if (L) {
    const { c, w, h } = L;
    const Lm = 46,
      R = 14,
      T = 12,
      B = 26;
    let lo = Math.min(...s, d.banda[0]),
      hi = Math.max(...s, d.banda[1]);
    const pad = (hi - lo) * 0.15 || 1;
    lo -= pad;
    hi += pad;
    if (k === "spo2") hi = Math.min(hi, 100.5);
    const X = (i) => Lm + (i / (s.length - 1)) * (w - Lm - R),
      Y = (v) => T + (1 - (v - lo) / (hi - lo)) * (h - T - B);
    c.fillStyle = css("--ok-bg");
    const b0 = Y(Math.min(d.banda[1], hi)),
      b1 = Y(Math.max(d.banda[0], lo));
    c.fillRect(Lm, b0, w - Lm - R, b1 - b0);
    c.strokeStyle = css("--line");
    c.fillStyle = css("--mute");
    c.lineWidth = 1;
    for (let i = 0; i <= 4; i++) {
      const v = lo + ((hi - lo) * i) / 4;
      c.beginPath();
      c.moveTo(Lm, Y(v));
      c.lineTo(w - R, Y(v));
      c.stroke();
      c.textAlign = "right";
      c.fillText(nf(v, d.d || (hi - lo < 5 ? 1 : 0)), Lm - 6, Y(v) + 4);
    }
    [0, 7, 14, 21, 29].forEach((i) => {
      c.textAlign = i === 29 ? "right" : "center";
      c.fillText(i === 29 ? "Hoy" : "D" + dias[i], X(i), h - 8);
    });
    c.strokeStyle = css("--accent");
    c.lineWidth = 2.4;
    c.lineJoin = "round";
    c.beginPath();
    s.forEach((v, i) => (i ? c.lineTo(X(i), Y(v)) : c.moveTo(X(i), Y(v))));
    c.stroke();
    s.forEach((v, i) => {
      const lv = d.lv(v);
      c.fillStyle = css(["--ok", "--warn", "--bad"][lv]);
      c.beginPath();
      c.arc(X(i), Y(v), i === 29 ? 5.5 : 3.2, 0, 7);
      c.fill();
    });
  }
  const t = tendencia(k);
  const hoyV = s[29],
    lv = d.lv(hoyV);
  const dir = Math.abs(t.dif) < (d.banda[1] - d.banda[0]) * 0.05 ? "estable" : t.dif > 0 ? "subió" : "bajó";
  $("#trendNote").textContent =
    d.n + ": promedio de " + nf(t.ult, d.d || 1) + " " + d.u + " en los últimos 7 días" +
    (dir === "estable" ? ", estable respecto a la semana anterior. " : "; " + dir + " " + nf(Math.abs(t.dif), d.d || 1) + " " + d.u + " frente a la semana anterior. ") +
    "Hoy está en " + LV[lv].toLowerCase() + ". Rango verde: " + d.rango[0] + " " + d.u + ".";
  proyectar();
}

function graficoProy(cv, mio, plan, o) {
  const L = lienzo(cv);
  if (!L) return;
  const { c, w, h } = L;
  const Lm = 44,
    R = 12,
    T = 12,
    B = 26;
  const X = (d) => Lm + (d / PLAN.total) * (w - Lm - R),
    Y = (y) => T + (1 - (y - o.min) / (o.max - o.min)) * (h - T - B);
  c.fillStyle = css("--panel2");
  c.fillRect(X(PLAN.ida), T, X(PLAN.ida + PLAN.superficie) - X(PLAN.ida), h - T - B);
  c.fillStyle = css("--mute");
  c.strokeStyle = css("--line");
  c.lineWidth = 1;
  for (let i = 0; i <= 4; i++) {
    const y = o.min + ((o.max - o.min) * i) / 4;
    c.beginPath();
    c.moveTo(Lm, Y(y));
    c.lineTo(w - R, Y(y));
    c.stroke();
    c.textAlign = "right";
    c.fillText(nf(y), Lm - 6, Y(y) + 4);
  }
  [0, 180, 430, 680, 860].forEach((d) => {
    c.textAlign = d === 0 ? "left" : d === 860 ? "right" : "center";
    c.fillText("D" + d, X(d), h - 8);
  });
  c.textAlign = "left";
  c.fillText("En Marte", X(PLAN.ida) + 6, T + 14);
  c.setLineDash([2, 3]);
  c.beginPath();
  c.moveTo(X(PLAN.hoy), T);
  c.lineTo(X(PLAN.hoy), h - B);
  c.stroke();
  c.fillText("Hoy", X(PLAN.hoy) + 5, T + 30);
  c.setLineDash([6, 4]);
  c.strokeStyle = css("--bad");
  c.lineWidth = 1.5;
  c.beginPath();
  c.moveTo(Lm, Y(o.lim));
  c.lineTo(w - R, Y(o.lim));
  c.stroke();
  c.fillStyle = css("--bad");
  c.textAlign = "right";
  c.fillText(o.label, w - R - 4, Y(o.lim) + (o.labelBelow ? 16 : -6));
  const linea = (pts, col, dash, lw) => {
    c.setLineDash(dash);
    c.strokeStyle = col;
    c.lineWidth = lw;
    c.beginPath();
    pts.forEach(([d, y], i) => (i ? c.lineTo(X(d), Y(y)) : c.moveTo(X(d), Y(y))));
    c.stroke();
  };
  linea(plan, css("--mute"), [5, 4], 2);
  linea(mio, css("--accent"), [], 2.6);
  c.setLineDash([]);
}

function proyectar() {
  const p = S.proj;
  $("#oAdh").textContent = p.adh + " %";
  $("#oRef").textContent = p.ref + " h";
  $("#oTor").textContent = p.tor;
  const m = modelo(p.adh / 100, p.ref, p.tor),
    pl = modelo(0.8, 8, 1);
  graficoProy($("#chBone"), m.hueso, pl.hueso, { min: 80, max: 100, lim: 90, label: "Vigilancia de fractura", labelBelow: true });
  graficoProy($("#chDose"), m.dosis, pl.dosis, { min: 0, max: 1200, lim: PLAN.limite, label: "Límite de carrera 600 mSv" });
  const b = m.hueso.at(-1)[1],
    d = m.dosis.at(-1)[1];
  $("#verdict").textContent =
    "Con este ajuste vuelves a la Tierra con " + nf(b, 1) + " % de tu densidad ósea y " + nf(d) + " mSv acumulados, el " + nf((d / PLAN.limite) * 100) + " % del límite de carrera. " +
    (b < 90 ? "El hueso cruza el umbral de vigilancia: sube el ejercicio. " : "El hueso se mantiene sobre el umbral de vigilancia. ") +
    (d > PLAN.limite
      ? "La radiación supera el límite aun con más blindaje: una misión a Marte necesitaría una excepción de la agencia."
      : "La radiación queda dentro del límite.");
}
