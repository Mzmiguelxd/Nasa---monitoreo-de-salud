function risks() {
  const v = S.v,
    c = S.checkin,
    sl = v.sleep,
    mood = c ? c.mood : 4,
    stress = c ? c.stress : 2,
    rt = S.pvt ? S.pvt.rt : null;
  const F = {
    car: [
      [
        "Frecuencia en reposo de " + nf(v.hr) + " lpm",
        clamp((v.hr - 72) * 1.6, 0, 45),
      ],
      [
        "Variabilidad cardíaca baja, " + nf(v.hrv) + " ms",
        clamp((50 - v.hrv) * 1.3, 0, 32),
      ],
      [
        "Presión sistólica de " + nf(v.sys) + " mmHg",
        clamp((v.sys - 126) * 1.6, 0, 25),
      ],
      [
        "Oxígeno en " + nf(v.spo2, 1) + " %",
        clamp((95.5 - v.spo2) * 12, 0, 30),
      ],
      ["Reportaste palpitaciones", has("palp") ? 18 : 0],
      ["Desacondicionamiento por microgravedad", 9],
    ],
    bon: [
      [
        "Has perdido " + nf(100 - v.bone, 1) + " % de densidad",
        clamp((100 - v.bone) * 5, 0, 50),
      ],
      [
        "Te faltan " + nf(Math.max(0, 150 - S.exMin)) + " min de ejercicio hoy",
        clamp(((150 - S.exMin) / 150) * 30, 0, 30),
      ],
      ["Reportaste dolor lumbar", has("lumbar") ? 10 : 0],
      ["Meses sin carga gravitatoria", 6],
    ],
    imm: [
      [
        "Llevas " + nf(v.cum) + " mSv, " + nf(v.cum / 6) + " % del límite",
        clamp((v.cum / 600) * 32, 0, 40),
      ],
      [
        "Tasa de radiación de " + nf(v.dose, 1) + " mSv/día",
        clamp((v.dose - 1.6) * 4.2, 0, 60),
      ],
      ["Dormiste " + nf(sl, 1) + " h", clamp((7 - sl) * 8, 0, 22)],
      [
        "Temperatura de " + nf(v.temp, 1) + " °C",
        clamp((v.temp - 37.4) * 30, 0, 25),
      ],
      ["Reportaste erupción en la piel", has("piel") ? 9 : 0],
      ["Reportaste congestión", has("congestion") ? 7 : 0],
    ],
    beh: [
      ["Dormiste " + nf(sl, 1) + " h", clamp((7 - sl) * 10, 0, 30)],
      ["Ánimo en " + mood + " de 5", (5 - mood) * 7],
      ["Estrés en " + stress + " de 5", (stress - 1) * 5],
      [
        rt
          ? "Reacción media de " + nf(rt) + " ms"
          : "Sin prueba de reflejos hoy",
        rt ? clamp((rt - 300) / 7, 0, 26) : 5,
      ],
      [
        "CO₂ en cabina de " + nf(v.co2, 1) + " mmHg",
        clamp((v.co2 - 3.8) * 18, 0, 48),
      ],
      ["Reportaste dolor de cabeza", has("cefalea") ? 7 : 0],
      ["Reportaste visión borrosa", has("vision") ? 12 : 0],
      [nf(S.day) + " días de aislamiento", (S.day / S.total) * 12],
    ],
  };
  const R = {};
  for (const k in F) {
    const f = F[k].filter((x) => x[1] >= 3).sort((a, b) => b[1] - a[1]);
    const score = Math.round(clamp(F[k].reduce((a, x) => a + x[1], 0)));
    R[k] = { score, f, lv: score >= 65 ? 2 : score >= 35 ? 1 : 0 };
  }
  return R;
}
const LV = ["En rango", "Vigilar", "Actuar"];

function actions(R) {
  const v = S.v,
    a = [];
  const add = (id, u, t, w, b, fn) => {
    if (!S.done[id]) a.push({ id, u, t, w, b, fn });
  };
  if (v.dose > 4 && !S.done.refugio)
    add(
      "refugio",
      2,
      "Entra al refugio de tormentas ahora",
      "La tasa de radiación es " +
        nf(v.dose / 1.1) +
        " veces la habitual. El blindaje de agua la reduce a una fracción.",
      "Ya estoy dentro",
    );
  if (R.car.lv === 2)
    add(
      "reposo",
      2,
      "Detén lo que haces, reposa diez minutos y registra un ECG",
      "Tu corazón trabaja fuera de rango en reposo. Si no baja tras el reposo, envía el ECG a Tierra.",
      "Reposo hecho",
    );
  if (v.co2 > 4.2)
    add(
      "co2",
      2,
      "Revisa el depurador de CO₂ y abre la ventilación entre módulos",
      "El CO₂ alto causa dolor de cabeza y embota el juicio antes de que lo notes.",
      "Depurador revisado",
    );
  if (has("vision"))
    add(
      "vision",
      1,
      "Hazte la tomografía de retina con el equipo de a bordo",
      "La visión borrosa puede ser el síndrome neuro-ocular del vuelo espacial. Conviene comparar con tu imagen anterior.",
      "Examen hecho",
    );
  if (v.sleep < 6.2)
    add(
      "sueno",
      1,
      "Protege el sueño de esta noche",
      "Atenúa la luz dos horas antes, corta la cafeína desde mediodía y avisa a tu compañera de turno.",
      "Plan en marcha",
    );
  if (S.checkin && S.checkin.mood <= 2)
    add(
      "animo",
      1,
      "Habla hoy con alguien de la tripulación",
      "Tu ánimo lleva bajo desde el último chequeo. Compartirlo temprano es el mejor contrapeso al aislamiento.",
      "Conversación hecha",
    );
  if (S.exMin < 150)
    add(
      "ejercicio",
      1,
      "Completa tu sesión de resistencia: faltan " + nf(150 - S.exMin) + " min",
      "Es lo que más frena la pérdida de hueso y músculo.",
      "Sesión completada",
    );
  if (!S.checkin || S.checkin.day !== S.day)
    add(
      "chequeo",
      0,
      "Registra tu chequeo diario",
      "Ánimo, estrés, sueño y síntomas completan lo que los sensores no ven.",
      "Abrir chequeo",
      () => (location.hash = "chequeo"),
    );
  if (!S.pvt || S.pvt.day !== S.day)
    add(
      "pvt",
      0,
      "Haz la prueba de reflejos de hoy",
      "Un minuto para detectar fatiga a tiempo.",
      "Abrir prueba",
      () => (location.hash = "chequeo"),
    );
  return a.sort((x, y) => y.u - x.u);
}
