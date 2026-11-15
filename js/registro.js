const CAMPOS = ["pas", "pad", "fc", "glu", "temp", "spo2", "sueno", "ejer"];

function construirRegistro() {
  const box = $("#fields");
  for (const k of CAMPOS) {
    const d = IND[k];
    const f = el("div", "field");
    const lab = el("label");
    lab.htmlFor = "f-" + k;
    const pill = el("span", "pill na", "Sin dato");
    pill.id = "p-" + k;
    lab.append(el("span", "", d.n), pill);
    const row = el("div", "in");
    const inp = document.createElement("input");
    inp.type = "number";
    inp.id = "f-" + k;
    inp.inputMode = "decimal";
    inp.step = d.d ? "0.1" : "1";
    inp.min = d.min;
    inp.max = d.max;
    inp.placeholder = "Rango " + d.rango[0];
    const r = reg();
    if (["pas", "pad", "glu", "sueno", "ejer"].includes(k) && r[k] != null) inp.value = r[k];
    inp.oninput = () => colorCampo(k);
    row.append(inp, el("span", "u", d.u));
    const det = el("details");
    det.append(el("summary", "", "Cómo se mide"));
    const ol = el("ol");
    d.como.forEach((c) => ol.append(el("li", "", c)));
    det.append(ol, el("p", "why", "Por qué importa: " + d.porque));
    f.append(lab, row, det);
    box.append(f);
    colorCampo(k);
  }
  const r = reg();
  $("#animo").value = r.animo ?? 4;
  $("#estres").value = r.estres ?? 2;
  ["animo", "estres"].forEach((i) => ($("#" + i).oninput = salidas));
  salidas();
  const sy = $("#sym");
  for (const k in SINT) {
    const b = el("button", "chipbtn", SINT[k].n);
    b.type = "button";
    b.dataset.k = k;
    b.setAttribute("aria-pressed", S.sintBase.includes(k) ? "true" : "false");
    b.onclick = () => b.setAttribute("aria-pressed", b.getAttribute("aria-pressed") === "true" ? "false" : "true");
    sy.append(b);
  }
  $("#form").addEventListener("submit", (e) => {
    e.preventDefault();
    guardarRegistro();
  });
  $("#pad").addEventListener("pointerdown", (e) => {
    e.preventDefault();
    pvtToque();
  });
  $("#pad").addEventListener("keydown", (e) => {
    if (e.key === " " || e.key === "Enter") {
      e.preventDefault();
      pvtToque();
    }
  });
  $("#camBtn").onclick = () => (cam.on ? pararPulso("Medición detenida.") : iniciarPulso());
  $("#camUsar").onclick = () => {
    $("#f-fc").value = cam.bpm;
    colorCampo("fc");
    $("#f-fc").focus();
    toast("Pulso copiado al formulario");
  };
}

function colorCampo(k) {
  const v = parseFloat($("#f-" + k).value);
  const p = $("#p-" + k);
  if (isNaN(v)) {
    p.className = "pill na";
    p.textContent = "Sin dato";
    return;
  }
  const lv = IND[k].lv(v);
  p.className = "pill lv" + lv;
  p.textContent = LV[lv];
}

function salidas() {
  const A = ["", "Muy mal", "Mal", "Regular", "Bien", "Muy bien"],
    T = ["", "Mínimo", "Leve", "Moderado", "Alto", "Muy alto"];
  $("#oAnimo").textContent = A[$("#animo").value];
  $("#oEstres").textContent = T[$("#estres").value];
}

function guardarRegistro() {
  const partes = [];
  const h = ahora();
  for (const k of CAMPOS) {
    const raw = $("#f-" + k).value;
    if (raw === "") continue;
    const v = parseFloat(raw);
    if (isNaN(v) || v < IND[k].min || v > IND[k].max) {
      toast(IND[k].n + ": revisa el valor, debe estar entre " + IND[k].min + " y " + IND[k].max);
      $("#f-" + k).focus();
      return;
    }
    if (IND[k].fuente === "sensor") {
      S.man[k] = { v, ts: Date.now(), hora: h };
      if (k === "fc") S.mis.pulso = true;
    } else {
      if (S.regBase[k] !== v) delete S.hecho["ind:" + k];
      S.regBase[k] = v;
      delete S.regEsc[k];
    }
    partes.push(IND[k].n.toLowerCase() + " " + nf(v, IND[k].d) + " " + IND[k].u);
  }
  S.regBase.animo = +$("#animo").value;
  S.regBase.estres = +$("#estres").value;
  delete S.regEsc.animo;
  delete S.regEsc.estres;
  S.regBase.hora = h;
  S.sintBase = $$("#sym [aria-pressed='true']").map((b) => b.dataset.k);
  S.sintEsc = S.sintEsc.filter((s) => S.sintBase.includes(s));
  partes.push("ánimo " + S.regBase.animo + "/5", "estrés " + S.regBase.estres + "/5");
  if (S.sintBase.length) partes.push("síntomas: " + S.sintBase.map((s) => SINT[s].n.toLowerCase()).join(", "));
  anotar("Registro: " + partes.join(", "));
  disco.guardar();
  toast("Registro guardado");
  pintar();
}

function pintarBitacora() {
  const ul = $("#log");
  if (!ul) return;
  ul.textContent = "";
  if (!S.log.length) {
    ul.append(el("li", "empty", "Aún no hay entradas. Guarda un registro, mide tu pulso o haz la prueba de reflejos."));
    return;
  }
  S.log.forEach((x) => {
    const li = el("li");
    li.append(el("span", "", "D" + x.d + " " + x.h), el("div", "", x.t));
    ul.append(li);
  });
}

const P = { st: "idle", n: 0, rts: [], t0: 0, tm: null };
function pvtSiguiente() {
  P.st = "wait";
  const p = $("#pad");
  p.className = "pad wait";
  p.textContent = "Espera el verde…";
  P.tm = setTimeout(() => {
    P.st = "go";
    P.t0 = performance.now();
    p.className = "pad go";
    p.textContent = "¡Ahora!";
  }, 1500 + Math.random() * 2500);
}
function pvtToque() {
  const p = $("#pad");
  if (P.st === "idle") {
    P.n = 0;
    P.rts = [];
    $("#pvtRes").textContent = "";
    pvtSiguiente();
    return;
  }
  if (P.st === "wait") {
    clearTimeout(P.tm);
    p.textContent = "Muy pronto. Va de nuevo…";
    P.st = "pause";
    setTimeout(pvtSiguiente, 900);
    return;
  }
  if (P.st === "go") {
    const rt = performance.now() - P.t0;
    P.rts.push(rt);
    P.n++;
    if (P.n < 5) {
      p.className = "pad wait";
      p.textContent = nf(rt) + " ms";
      P.st = "pause";
      setTimeout(pvtSiguiente, 700);
      return;
    }
    const m = Math.round(P.rts.reduce((a, b) => a + b, 0) / 5),
      lap = P.rts.filter((x) => x > 500).length;
    S.regBase.reac = m;
    S.regBase.horaReac = ahora();
    delete S.hecho["ind:reac"];
    S.mis.reflejos = true;
    if (!S.mejorReac || m < S.mejorReac) S.mejorReac = m;
    P.st = "idle";
    p.className = "pad";
    p.textContent = "Repetir prueba";
    const lv = IND.reac.lv(m);
    $("#pvtRes").textContent =
      "Media de " + nf(m) + " ms con " + lap + (lap === 1 ? " lapso" : " lapsos") + " de más de 500 ms. " +
      ["Estás alerta.", "Algo de fatiga: evita tareas críticas largas sin pausa.", "Fatiga marcada: pospón maniobras críticas y descansa."][lv];
    anotar("Reflejos: " + nf(m) + " ms de media, " + lap + " lapsos");
    disco.guardar();
    pintar();
  }
}

const cam = { on: false, stream: null, raf: 0, t0: 0, xs: [], bpm: 0 };
const DUR = 20000;
async function iniciarPulso() {
  const msg = $("#camMsg");
  $("#camUsar").hidden = true;
  if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
    msg.textContent = "Este navegador no permite usar la cámara aquí. Mide a mano: cuenta tus latidos 30 segundos y multiplica por dos.";
    return;
  }
  try {
    cam.stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "environment", width: 160, height: 120 }, audio: false });
  } catch (e) {
    msg.textContent = "No se pudo abrir la cámara. Revisa el permiso del navegador o mide a mano: cuenta tus latidos 30 segundos y multiplica por dos.";
    return;
  }
  const track = cam.stream.getVideoTracks()[0];
  try {
    await track.applyConstraints({ advanced: [{ torch: true }] });
  } catch (e) {}
  const v = $("#camVideo");
  v.srcObject = cam.stream;
  await v.play().catch(() => {});
  cam.on = true;
  cam.xs = [];
  cam.t0 = performance.now();
  $("#camBtn").textContent = "Detener";
  $("#camBpm").textContent = "—";
  msg.textContent = "Cubre la lente trasera y el flash con la yema del dedo, sin apretar. Quédate quieto 20 segundos.";
  const off = document.createElement("canvas");
  off.width = 40;
  off.height = 30;
  const oc = off.getContext("2d", { willReadFrequently: true });
  const loop = () => {
    if (!cam.on) return;
    const t = performance.now() - cam.t0;
    try {
      oc.drawImage(v, 0, 0, 40, 30);
      const px = oc.getImageData(0, 0, 40, 30).data;
      let r = 0,
        g = 0;
      for (let i = 0; i < px.length; i += 4) {
        r += px[i];
        g += px[i + 1];
      }
      const n = px.length / 4;
      cam.xs.push({ t, r: r / n, g: g / n });
    } catch (e) {}
    $("#camProg").style.width = clamp((t / DUR) * 100) + "%";
    dibujarSenal();
    if (t >= DUR) return terminarPulso();
    cam.raf = requestAnimationFrame(loop);
  };
  cam.raf = requestAnimationFrame(loop);
}
function pararPulso(t) {
  cam.on = false;
  cancelAnimationFrame(cam.raf);
  if (cam.stream) cam.stream.getTracks().forEach((x) => x.stop());
  cam.stream = null;
  $("#camBtn").textContent = "Medir con la cámara";
  if (t) $("#camMsg").textContent = t;
}
function filtrada() {
  const xs = cam.xs;
  const out = [];
  for (let i = 0; i < xs.length; i++) {
    let s = 0,
      c = 0;
    for (let j = i; j >= 0 && xs[i].t - xs[j].t < 1000; j--) {
      s += xs[j].r;
      c++;
    }
    out.push({ t: xs[i].t, y: xs[i].r - s / c });
  }
  return out;
}
function dibujarSenal() {
  const cv = $("#camWave"),
    w = cv.clientWidth,
    h = cv.clientHeight;
  if (!w) return;
  const dpr = window.devicePixelRatio || 1;
  cv.width = w * dpr;
  cv.height = h * dpr;
  const c = cv.getContext("2d");
  c.scale(dpr, dpr);
  const f = filtrada().slice(-120);
  if (f.length < 2) return;
  const mx = Math.max(...f.map((p) => Math.abs(p.y))) || 1;
  c.strokeStyle = css("--accent");
  c.lineWidth = 1.8;
  c.beginPath();
  f.forEach((p, i) => {
    const x = (i / 119) * w,
      y = h / 2 + (p.y / mx) * (h * 0.4);
    i ? c.lineTo(x, y) : c.moveTo(x, y);
  });
  c.stroke();
}
function terminarPulso() {
  const xs = cam.xs;
  pararPulso();
  const rojo = xs.reduce((a, p) => a + p.r, 0) / (xs.length || 1);
  const verde = xs.reduce((a, p) => a + p.g, 0) / (xs.length || 1);
  if (xs.length < 100 || rojo < 80 || rojo < verde * 1.6) {
    $("#camMsg").textContent = "La señal fue débil: la lente no quedó bien cubierta o faltó luz. Prueba de nuevo con el dedo inmóvil sobre la lente y el flash.";
    return;
  }
  const f = filtrada().filter((p) => p.t > 2000);
  const ys = f.map((p) => p.y);
  const sd = Math.sqrt(ys.reduce((a, y) => a + y * y, 0) / ys.length);
  const picos = [];
  for (let i = 2; i < f.length - 2; i++) {
    const y = f[i].y;
    if (y > sd * 0.5 && y >= f[i - 1].y && y >= f[i - 2].y && y > f[i + 1].y && y > f[i + 2].y) {
      if (!picos.length || f[i].t - picos[picos.length - 1] > 330) picos.push(f[i].t);
    }
  }
  if (picos.length < 6) {
    $("#camMsg").textContent = "No se distinguieron latidos claros. Repite la medición sin mover el dedo.";
    return;
  }
  const ints = picos.slice(1).map((t, i) => t - picos[i]).sort((a, b) => a - b);
  const med = ints[Math.floor(ints.length / 2)];
  const bpm = Math.round(60000 / med);
  if (bpm < 40 || bpm > 180) {
    $("#camMsg").textContent = "La lectura salió fuera de lo esperable. Repite la medición sin mover el dedo.";
    return;
  }
  cam.bpm = bpm;
  $("#camBpm").textContent = bpm;
  const lv = IND.fc.lv(bpm);
  $("#camMsg").textContent = "Pulso medido con la cámara: " + LV[lv].toLowerCase() + ". Puedes pasarlo al registro.";
  $("#camUsar").hidden = false;
  S.man.fc = { v: bpm, ts: Date.now(), hora: ahora() };
  S.mis.pulso = true;
  S.camOk = true;
  anotar("Pulso con cámara: " + bpm + " lpm");
  disco.guardar();
  pintar();
}
