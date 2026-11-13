function localAdvice(R) {
  const top = Object.keys(R).sort((a, b) => R[b].score - R[a].score)[0],
    r = R[top],
    A = actions(R).slice(0, 3);
  return (
    "Evaluación local, sin enlace.\n\nTu sistema con más riesgo es " +
    SYS[top].n.toLowerCase() +
    ", en " +
    r.score +
    " de 100 (" +
    LV[r.lv].toLowerCase() +
    ").\n" +
    (r.f.length
      ? "Lo que más pesa: " +
        r.f
          .slice(0, 3)
          .map((x) => x[0].toLowerCase())
          .join("; ") +
        ".\n"
      : "") +
    "\n" +
    (A.length
      ? "Haz esto, en orden:\n" +
        A.map((a, i) => i + 1 + ". " + a.t + ".").join("\n")
      : "No hay acciones pendientes.") +
    "\n\n" +
    SYS[top].c
  );
}
function msg(c, t) {
  const m = el("div", "msg " + c, t);
  $("#chat").append(m);
  m.scrollIntoView({ block: "nearest" });
  return m;
}
let busy = false;
async function ask(q) {
  q = (q || "").trim();
  if (!q || busy) return;
  msg("tu", q);
  $("#q").value = "";
  const R = risks(),
    out = msg("ia", sample ? "Pensando…" : localAdvice(R));
  if (!sample) return;
  busy = true;
  const v = S.v,
    ctx = {
      dia_mision: S.day,
      dias_totales: S.total,
      retardo_ida_vuelta: $("#delay").textContent,
      situacion: SCN[S.scenario].n,
      signos: {
        fc_lpm: Math.round(v.hr),
        vfc_ms: Math.round(v.hrv),
        spo2: +v.spo2.toFixed(1),
        presion: Math.round(v.sys) + "/" + Math.round(v.dia),
        temp_c: +v.temp.toFixed(1),
        co2_cabina_mmHg: +v.co2.toFixed(1),
        radiacion_mSv_dia: +v.dose.toFixed(1),
        radiacion_acumulada_mSv: Math.round(v.cum),
        limite_carrera_mSv: 600,
        densidad_osea_pct_base: v.bone,
        sueno_h: v.sleep,
        ejercicio_min_hoy: S.exMin,
      },
      chequeo: S.checkin,
      reflejos: S.pvt,
      riesgos: Object.fromEntries(
        Object.keys(R).map((k) => [
          SYS[k].n,
          {
            puntaje: R[k].score,
            nivel: LV[R[k].lv],
            factores: R[k].f.slice(0, 4).map((x) => x[0]),
          },
        ]),
      ),
      acciones_pendientes: actions(R).map((a) => a.t),
    };
  const prompt =
    "Eres el oficial médico de a bordo de una nave en misión de larga duración a Marte. Hablas con un astronauta que debe evaluar y actuar por sí mismo porque Tierra responde con retardo. Responde en español, en texto plano sin markdown, en menos de 150 palabras. Sé concreto: prioriza, da pasos numerados cuando haya que actuar, di qué volver a medir y cuándo, y cuándo conviene escalar a Tierra considerando el retardo. No afirmes diagnósticos con certeza. Usa solo estos datos, que son simulados:\n" +
    JSON.stringify(ctx) +
    "\n\nPregunta del astronauta: " +
    q;
  try {
    const r = await sample(prompt, {
      cache: false,
      onText: ({ text }) => {
        if (text) out.textContent = text;
      },
    });
    out.textContent = r.text || localAdvice(R);
  } catch (e) {
    out.textContent =
      localAdvice(R) +
      "\n\nEl asistente no respondió; esta es la evaluación del motor local.";
  }
  busy = false;
}
