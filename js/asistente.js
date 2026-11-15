function textoInforme() {
  const E = evaluar();
  const L = [];
  L.push("INFORME DE SALUD · CENTINELA");
  L.push("Día de misión " + PLAN.hoy + " de " + PLAN.total + " · " + ENTORNOS[S.env].n + " · hora de a bordo " + ahora());
  L.push("Nivel de atención: " + ESCALERA[E.esc].n);
  L.push("");
  L.push("Fuera de rango:");
  const fuera = [...E.rojos, ...E.ambar];
  if (!fuera.length) L.push("- Ninguno");
  fuera.forEach((it) =>
    L.push("- " + nombreItem(it) + ": " + (it.tipo === "ind" ? textoValor(it.k) : "reportado") + " (" + (it.lv === 2 ? "rojo" : "ámbar") + ")")
  );
  L.push("");
  L.push("Signos actuales:");
  ["fc", "pas", "spo2", "temp", "glu", "sueno", "dosis", "acum", "osea"].forEach((k) => {
    const v = valor(k);
    if (v != null) L.push("- " + IND[k].n + ": " + (k === "pas" ? nf(v) + "/" + nf(valor("pad") ?? 0) + " mmHg" : textoValor(k)));
  });
  const hechas = Object.keys(S.hecho).filter((k) => S.hecho[k] && k !== "informe");
  L.push("");
  L.push("Acciones hechas: " + (hechas.length ? hechas.map((h) => (h.startsWith("ind:") ? IND[h.slice(4)].accion : SINT_ACC[h.slice(5)] || h)).join(" ") : "ninguna todavía"));
  const ts = tendencia("sueno");
  L.push("Sueño, promedio de 7 días: " + nf(ts.ult, 1) + " h (semana anterior " + nf(ts.prev, 1) + " h)");
  L.push("");
  L.push("Pregunta para Tierra: ");
  return L.join("\n");
}

function prepararInforme() {
  $("#report").value = textoInforme();
  $("#reportBox").hidden = false;
  anotar("Informe para cirujanos de vuelo preparado");
}

function consejoLocal() {
  const E = evaluar();
  const peor = Object.keys(E.zonas).sort((a, b) => E.zonas[b].lv - E.zonas[a].lv || E.zonas[b].items.length - E.zonas[a].items.length)[0];
  const A = acciones(E).filter((a) => a.u > 0 && a.id !== "informe").slice(0, 3);
  const z = E.zonas[peor];
  let t = "Evaluación local, sin conexión.\n\nNivel de atención: " + ESCALERA[E.esc].n.toLowerCase() + ". " + ESCALERA[E.esc].t + "\n\n";
  if (z.lv)
    t += "La zona que más te pide atención es " + ZONAS[peor].n.toLowerCase() + " (" + LV[z.lv].toLowerCase() + "): " +
      z.items.filter((i) => i.lv).map((i) => nombreItem(i).toLowerCase() + (i.tipo === "ind" ? " " + textoValor(i.k) : "")).join("; ") + ".\n\n";
  else t += "Todas las zonas del cuerpo están en rango.\n\n";
  t += A.length ? "Haz esto, en orden:\n" + A.map((a, i) => i + 1 + ". " + a.t).join("\n") : "No hay acciones pendientes. Sigue con tus misiones del día.";
  if (E.esc === 3) t += "\n\nPrepara el informe para Tierra: la respuesta tardará unos " + retardoTexto();
  return t;
}

function msg(c, t) {
  const m = el("div", "msg " + c, t);
  $("#chat").append(m);
  m.scrollIntoView({ block: "nearest" });
  return m;
}

let ocupado = false;
async function preguntar(q) {
  q = (q || "").trim();
  if (!q || ocupado) return;
  msg("tu", q);
  $("#q").value = "";
  if (/informe/i.test(q)) {
    prepararInforme();
    msg("ia", "Preparé tu informe con los datos de este momento. Revísalo, completa la pregunta para Tierra y cópialo.");
    return;
  }
  const out = msg("ia", sample ? "Pensando…" : consejoLocal());
  if (!sample) return;
  ocupado = true;
  const E = evaluar();
  const ctx = {
    dia_mision: PLAN.hoy,
    dias_totales: PLAN.total,
    entorno: ENTORNOS[S.env].n,
    gravedad: ENTORNOS[S.env].g ? "3/8 g" : "0 g",
    retardo_ida_vuelta: retardoTexto(),
    nivel_atencion: ESCALERA[E.esc].n,
    indicadores: Object.fromEntries(Object.keys(IND).filter((k) => valor(k) != null).map((k) => [IND[k].n, { valor: +Number(valor(k)).toFixed(IND[k].d), unidad: IND[k].u, estado: LV[IND[k].lv(valor(k))] }])),
    sintomas: sintomas().map((s) => SINT[s].n),
    acciones_pendientes: acciones(E).map((a) => a.t),
  };
  const prompt =
    "Eres el oficial médico de a bordo de una misión de larga duración a Marte. Hablas con un astronauta que debe evaluar y actuar por sí mismo porque Tierra responde con retardo. Responde en español, en texto plano sin markdown, en menos de 150 palabras. Prioriza, da pasos numerados cuando haya que actuar, di qué volver a medir y cuándo, y cuándo conviene escalar a los cirujanos de vuelo considerando el retardo. No afirmes diagnósticos con certeza. Usa solo estos datos, que son simulados:\n" +
    JSON.stringify(ctx) + "\n\nPregunta del astronauta: " + q;
  try {
    const r = await sample(prompt, { cache: false, onText: ({ text }) => text && (out.textContent = text) });
    out.textContent = r.text || consejoLocal();
  } catch (e) {
    out.textContent = consejoLocal() + "\n\nEl asistente no respondió; esta es la evaluación del motor local.";
  }
  ocupado = false;
}

function construirAsistente() {
  ["¿Qué debo vigilar hoy?", "¿Cuándo aviso a Tierra?", "Prepara mi informe para Tierra"].forEach((q) => {
    const b = el("button", "chipbtn", q);
    b.type = "button";
    b.onclick = () => preguntar(q);
    $("#quick").append(b);
  });
  $("#ask").onclick = () => preguntar($("#q").value);
  $("#q").addEventListener("keydown", (e) => e.key === "Enter" && preguntar($("#q").value));
  $("#copyRep").onclick = async () => {
    const t = $("#report");
    try {
      await navigator.clipboard.writeText(t.value);
      toast("Informe copiado");
    } catch (e) {
      t.select();
      toast("Selecciona y copia el texto");
    }
  };
}
