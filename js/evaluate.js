const CRITICOS = ["spo2", "fc", "pas", "disnea", "palp", "vision"];
const LV = ["En rango", "Vigilar", "Actuar"];

function nivel(k) {
  const v = valor(k);
  return v == null ? null : IND[k].lv(v);
}

function evaluar() {
  const zonas = {};
  const items = [];
  for (const k in IND) {
    const l = nivel(k);
    if (l != null) items.push({ tipo: "ind", k, lv: l });
  }
  for (const s of sintomas()) items.push({ tipo: "sint", k: s, lv: SINT[s].lv });
  for (const z in ZONAS) {
    const propios = items.filter((it) => (it.tipo === "ind" ? IND[it.k].z : SINT[it.k].z) === z);
    zonas[z] = { lv: propios.reduce((a, it) => Math.max(a, it.lv), 0), items: propios };
  }
  const rojos = items.filter((it) => it.lv === 2);
  const ambar = items.filter((it) => it.lv === 1);
  let esc = 0;
  if (ambar.length) esc = 1;
  if (rojos.length) esc = 2;
  if (rojos.length >= 2 || rojos.some((it) => CRITICOS.includes(it.k))) esc = 3;
  return { zonas, items, rojos, ambar, esc };
}

function nombreItem(it) {
  return it.tipo === "ind" ? IND[it.k].n : SINT[it.k].n;
}
function textoValor(k) {
  const v = valor(k);
  return v == null ? "sin dato" : nf(v, IND[k].d) + " " + IND[k].u;
}

function acciones(E) {
  const a = [];
  const vistos = new Set();
  const lista = [...E.rojos, ...E.ambar];
  for (const it of lista) {
    const id = it.tipo + ":" + it.k;
    if (vistos.has(id)) continue;
    vistos.add(id);
    if (S.hecho[id]) {
      if (it.tipo === "ind" && IND[it.k].fuente === "registro")
        a.push({
          id: id + ":re",
          u: 1,
          t: "Vuelve a medir: " + IND[it.k].n.toLowerCase(),
          w: "Ya hiciste la acción. Registra el valor nuevo para saber si funcionó.",
          b: "Registrar",
          ir: "registro",
        });
      continue;
    }
    const t = it.tipo === "ind" ? IND[it.k].accion : SINT_ACC[it.k];
    const w = it.tipo === "ind" ? IND[it.k].n + ": " + textoValor(it.k) : "Síntoma reportado: " + SINT[it.k].n.toLowerCase();
    a.push({ id, u: it.lv, t, w, b: "Hecho" });
  }
  if (E.esc === 3 && !S.hecho.informe)
    a.unshift({
      id: "informe",
      u: 2,
      t: "Prepara el informe para los cirujanos de vuelo",
      w: "La respuesta de Tierra tardará unos " + retardoTexto() + " Envíalo ahora y sigue las acciones mientras tanto.",
      b: "Preparar informe",
      ir: "medico",
    });
  for (const m of MISIONES) {
    if (a.length >= 7) break;
    if (!misionHecha(m.id) && ["pulso", "reflejos", "ejercicio"].includes(m.id))
      a.push({ id: "m:" + m.id, u: 0, t: m.n, w: m.d + ". Misión del día, +" + m.xp + " XP.", b: "Ir", ir: m.id === "ejercicio" ? "registro" : "registro" });
  }
  return a.sort((x, y) => y.u - x.u);
}

function retardoMin() {
  if (ENTORNOS[S.env].cerca) return 0;
  return 3 + 19 * Math.sin((Math.PI * PLAN.hoy) / PLAN.total);
}
function retardoTexto() {
  const m = retardoMin() * 2;
  if (m < 1) return "1 segundo.";
  return Math.round(m) + " minutos entre ida y vuelta.";
}

function tendencia(k) {
  const s = serie(k);
  const a = s.slice(-7).reduce((x, y) => x + y, 0) / 7;
  const b = s.slice(-14, -7).reduce((x, y) => x + y, 0) / 7;
  return { ult: a, prev: b, dif: a - b };
}
