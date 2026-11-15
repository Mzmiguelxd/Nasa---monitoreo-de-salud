const RUIDO = { fc: 2.2, vfc: 3.5, spo2: 0.25, temp: 0.05, co2: 0.1, dosis: 0.05 };

function objetivos() {
  const en = ENTORNOS[S.env];
  const t = { fc: 63, vfc: 56, spo2: 97.6, temp: 36.7, co2: en.co2, dosis: en.rad, ...ESCENARIOS[S.escenario].t };
  if (S.hecho["ind:dosis"]) t.dosis = Math.min(t.dosis, en.rad * 0.6);
  if (S.hecho["ind:co2"] || S.hecho["sint:disnea"]) {
    t.co2 = Math.min(t.co2, 3);
    t.spo2 = Math.max(t.spo2, 97.2);
  }
  if (S.hecho["ind:fc"] || S.hecho["sint:palp"]) {
    t.fc = Math.min(t.fc, 82);
    t.vfc = Math.max(t.vfc, 40);
  }
  if (S.hecho["ind:spo2"]) t.spo2 = Math.max(t.spo2, 96.5);
  if (S.hecho["ind:vfc"]) t.vfc = Math.max(t.vfc, 41);
  return t;
}

function paso(f = 0.2) {
  const t = objetivos();
  for (const k in S.v) S.v[k] += (t[k] - S.v[k]) * f + (Math.random() - 0.5) * RUIDO[k];
  S.v.spo2 = Math.min(100, S.v.spo2);
  if (S.v.dosis > 3) S.acum += S.v.dosis / 1440;
}

function ponerEscenario(k) {
  S.escenario = k;
  S.hecho = {};
  S.regEsc = { ...(ESCENARIOS[k].reg || {}) };
  S.sintEsc = [...(ESCENARIOS[k].sint || [])];
  for (let i = 0; i < 6; i++) paso(0.5);
  anotar("Simulación: " + ESCENARIOS[k].n.toLowerCase());
}
