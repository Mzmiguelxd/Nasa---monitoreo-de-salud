const NS = "http://www.w3.org/2000/svg";
const refs = { zonas: {}, chips: {}, vit: {} };

function construirPanel() {
  const env = $("#env");
  for (const k in ENTORNOS) {
    const b = el("button", "", ENTORNOS[k].n);
    b.setAttribute("role", "radio");
    b.dataset.k = k;
    b.onclick = () => {
      S.env = k;
      anotar("Entorno: " + ENTORNOS[k].n.toLowerCase());
      for (let i = 0; i < 6; i++) paso(0.5);
      pintar();
    };
    env.append(b);
  }
  const g = $("#zonas");
  const lista = $("#zonaChips");
  for (const k in ZONAS) {
    const z = ZONAS[k];
    const n = document.createElementNS(NS, "g");
    n.setAttribute("class", "zn");
    n.setAttribute("tabindex", "0");
    n.setAttribute("role", "button");
    n.setAttribute("aria-label", z.n);
    n.innerHTML =
      "<title>" + z.n + "</title>" +
      '<circle class="hit" cx="' + z.x + '" cy="' + z.y + '" r="17"/>' +
      '<circle class="p" cx="' + z.x + '" cy="' + z.y + '" r="9"/>' +
      '<circle class="r" cx="' + z.x + '" cy="' + z.y + '" r="15"/>' +
      '<circle class="d" cx="' + z.x + '" cy="' + z.y + '" r="9"/>';
    const ir = () => {
      S.sel = k;
      pintar();
    };
    n.onclick = ir;
    n.onkeydown = (e) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        ir();
      }
    };
    g.append(n);
    refs.zonas[k] = n;
    const c = el("button", "chipbtn", z.n);
    c.onclick = ir;
    lista.append(c);
    refs.chips[k] = c;
  }
  const sc = $("#scn");
  for (const k in ESCENARIOS) {
    const b = el("button", "btn ghost", ESCENARIOS[k].n);
    b.dataset.k = k;
    b.onclick = () => {
      ponerEscenario(k);
      pintar();
    };
    sc.append(b);
  }
  const vt = $("#vitals");
  for (const k of ["fc", "pas", "spo2", "temp", "glu", "co2", "dosis", "acum", "sueno", "reac", "osea", "ejer", "vfc", "animo"]) {
    const d = IND[k];
    const t = el("button", "vit" + (k === "fc" ? " wide" : ""));
    t.type = "button";
    const v = el("div", "v"),
      meta = el("div", "meta"),
      st = el("span", "pill"),
      src = el("span", "", "");
    meta.append(src, st);
    t.append(el("div", "n", d.n), v, meta);
    if (k === "fc") {
      const c = document.createElement("canvas");
      c.id = "ecg";
      c.setAttribute("aria-hidden", "true");
      t.append(c);
    } else {
      t.insertAdjacentHTML("beforeend", '<svg viewBox="0 0 100 26" preserveAspectRatio="none" aria-hidden="true"><polyline/></svg>');
    }
    t.onclick = () => {
      S.sel = d.z;
      pintar();
      $(".body-grid").scrollIntoView({ behavior: "smooth", block: "start" });
    };
    vt.append(t);
    refs.vit[k] = { t, v, st, src, pl: $("polyline", t) };
  }
}

let firmaAcc = "";
function pintarPanel(E) {
  $$("#env button").forEach((b) => b.setAttribute("aria-checked", b.dataset.k === S.env ? "true" : "false"));
  const en = ENTORNOS[S.env];
  $("#fDia").textContent = PLAN.hoy + " de " + PLAN.total;
  $("#fGrav").textContent = en.g ? "3/8 g" : "0 g";
  $("#fRad").textContent = nf(S.v.dosis, 2) + " mSv/día";
  $("#fRet").textContent = en.cerca ? "1 s" : Math.round(retardoMin() * 2) + " min";
  $("#envDesc").textContent = en.desc;
  $$("#ladder .step").forEach((s, i) => s.classList.toggle("on", i === E.esc));
  for (const k in ZONAS) {
    const lv = E.zonas[k].lv;
    refs.zonas[k].setAttribute("class", "zn lv" + lv + (S.sel === k ? " sel" : ""));
    const c = refs.chips[k];
    c.setAttribute("aria-pressed", S.sel === k ? "true" : "false");
    c.style.borderColor = S.sel === k ? "" : lv ? (lv === 2 ? "var(--bad)" : "var(--warn)") : "";
  }
  pintarZona(E);
  const A = acciones(E);
  const firma = A.map((a) => a.id + a.t + a.w.replace(/[\d,.]+/g, "")).join("|");
  if (firma !== firmaAcc) {
    firmaAcc = firma;
    const ul = $("#acts");
    ul.textContent = "";
    if (!A.length) ul.append(el("li", "u0", "Todo al día. Los sensores siguen vigilando y te avisarán si algo cambia."));
    A.forEach((a) => {
      const li = el("li", "u" + a.u),
        d = el("div");
      d.append(el("strong", "", a.t), el("small", "", a.w));
      const b = el("button", "btn" + (a.u ? "" : " ghost"), a.b);
      b.onclick = () => {
        if (a.ir) {
          if (a.id === "informe") {
            S.hecho.informe = true;
            prepararInforme();
          }
          location.hash = a.ir;
          return;
        }
        S.hecho[a.id] = true;
        if (a.id === "ind:dosis") S.escudo = true;
        S.xpAcc += 10;
        anotar("Acción: " + a.t.toLowerCase());
        disco.guardar();
        toast("Acción registrada, +10 XP");
        pintar();
      };
      li.append(d, b);
      ul.append(li);
    });
  }
  for (const k in refs.vit) {
    const r = refs.vit[k],
      d = IND[k],
      x = valor(k);
    const lv = x == null ? null : d.lv(x);
    r.t.className = "vit" + (k === "fc" ? " wide" : "") + (lv == null ? "" : " lv" + lv);
    r.v.textContent = x == null ? "—" : k === "pas" ? nf(x) + "/" + nf(valor("pad") ?? 0) : nf(x, d.d);
    r.v.append(el("small", "", k === "pas" ? "mmHg" : d.u));
    r.st.textContent = lv == null ? "Sin dato" : LV[lv];
    r.st.className = "pill " + (lv == null ? "na" : "lv" + lv);
    r.src.textContent = origen(k);
    if (r.pl) {
      const h = k in S.v ? S.h[k] || [] : serie(k);
      if (h.length > 1) {
        const mn = Math.min(...h),
          mx = Math.max(...h),
          sp = mx - mn || 1;
        r.pl.setAttribute("points", h.map((y, i) => ((i / (h.length - 1)) * 100).toFixed(1) + "," + (24 - ((y - mn) / sp) * 21).toFixed(1)).join(" "));
      }
    }
  }
  $$("#scn button").forEach((b) => b.setAttribute("aria-pressed", b.dataset.k === S.escenario ? "true" : "false"));
}

function pintarZona(E) {
  const z = ZONAS[S.sel],
    st = E.zonas[S.sel];
  const box = $("#zone");
  box.textContent = "";
  const h = el("h2", "", z.n);
  const p = el("span", "pill lv" + st.lv, LV[st.lv]);
  h.append(p);
  box.append(h);
  const blk = (t, txt) => {
    const b = el("div", "blk");
    b.append(el("b", "", t), el("p", "", txt));
    box.append(b);
  };
  blk("Qué hace", z.fn);
  blk("Cómo le afecta el espacio", z.esp);
  const ul = el("ul", "ilist");
  for (const k of z.ind) {
    const x = valor(k),
      lv = x == null ? null : IND[k].lv(x);
    const li = el("li");
    const n = el("span", "", IND[k].n);
    const v = el("span", "val", x == null ? "—" : nf(x, IND[k].d));
    v.append(el("small", "", IND[k].u));
    li.append(n, v, el("span", "pill " + (lv == null ? "na" : "lv" + lv), lv == null ? "Sin dato" : LV[lv]));
    ul.append(li);
  }
  for (const s of sintomas().filter((s) => SINT[s].z === S.sel)) {
    const li = el("li");
    li.append(el("span", "", SINT[s].n), el("span", "val", "Reportado"), el("span", "pill lv" + SINT[s].lv, LV[SINT[s].lv]));
    ul.append(li);
  }
  if (!ul.children.length) ul.append(el("li", "empty", "Sin indicadores ni síntomas registrados para esta zona hoy."));
  box.append(ul);
  blk("Qué hacer", z.cuidado);
  const pel = el("div", "chips");
  for (const p of z.pel) pel.append(el("span", "pill na", PELIGROS[p].n));
  box.append(pel);
}

function alertar(E) {
  if (E.esc >= 2 && S.nivelPrev < 2) {
    const r = E.rojos[0];
    const t = ESCALERA[E.esc].n + ": " + nombreItem(r) + " fuera de rango. " + (r.tipo === "ind" ? IND[r.k].accion : SINT_ACC[r.k]);
    $("#alertText").textContent = t;
    $("#alert").classList.add("on");
    S.sel = r.tipo === "ind" ? IND[r.k].z : SINT[r.k].z;
    anotar("Alerta: " + nombreItem(r).toLowerCase() + " en rojo");
    pitido();
    decir(t);
  }
  if (E.esc < 2) $("#alert").classList.remove("on");
  S.nivelPrev = E.esc;
}

const ecg = { buf: [], ph: 0, last: 0 };
function onda(p) {
  const g = (c, a, w) => a * Math.exp(-((p - c) ** 2) / (2 * w * w));
  return g(0.18, 0.12, 0.025) + g(0.355, -0.14, 0.008) + g(0.38, 1, 0.011) + g(0.405, -0.22, 0.009) + g(0.62, 0.26, 0.04);
}
function dibujarEcg(ts) {
  const cv = $("#ecg");
  if (cv && cv.clientWidth) {
    const w = cv.clientWidth,
      h = cv.clientHeight,
      dpr = window.devicePixelRatio || 1;
    if (cv.width !== Math.round(w * dpr)) {
      cv.width = Math.round(w * dpr);
      cv.height = Math.round(h * dpr);
    }
    const dt = Math.min(0.05, (ts - ecg.last) / 1000 || 0);
    ecg.last = ts;
    const n = Math.max(1, Math.round((dt * w) / 3));
    for (let i = 0; i < n; i++) {
      ecg.ph += ((dt / n) * valor("fc")) / 60;
      ecg.buf.push(onda(ecg.ph % 1));
    }
    while (ecg.buf.length > w) ecg.buf.shift();
    const c = cv.getContext("2d");
    c.setTransform(dpr, 0, 0, dpr, 0, 0);
    c.clearRect(0, 0, w, h);
    c.strokeStyle = css("--accent");
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
  if (!matchMedia("(prefers-reduced-motion: reduce)").matches) requestAnimationFrame(dibujarEcg);
}
