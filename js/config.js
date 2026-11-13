const BASE = {
  hr: 62,
  hrv: 58,
  spo2: 97.5,
  temp: 36.7,
  sys: 118,
  dia: 76,
  co2: 2.8,
  dose: 1.1,
};
const NOISE = {
  hr: 2.4,
  hrv: 4,
  spo2: 0.3,
  temp: 0.06,
  sys: 2.5,
  dia: 2,
  co2: 0.12,
  dose: 0.12,
};
const SCN = {
  nominal: { n: "Día normal", t: {} },
  tormenta: { n: "Tormenta solar", t: { dose: 16, hr: 70 } },
  insomnio: {
    n: "Tres noches sin dormir",
    t: { hr: 73, hrv: 35, sys: 125 },
    sleep: 4.5,
  },
  co2: { n: "Falla del depurador de CO₂", t: { co2: 6.3, hr: 69, spo2: 96.4 } },
  cardio: {
    n: "Taquicardia en reposo",
    t: { hr: 118, hrv: 21, sys: 143, dia: 90 },
  },
};
const SYS = {
  beh: {
    n: "Mente y conducta",
    x: 100,
    y: 40,
    col: "L",
    c: "Protege tus ocho horas de sueño, mantén la rutina de luz del módulo y no te saltes el contacto con tu gente en Tierra aunque llegue con retardo.",
  },
  car: {
    n: "Corazón y circulación",
    x: 109,
    y: 118,
    col: "L",
    c: "El corazón pierde carga de trabajo sin gravedad. El ejercicio aeróbico diario y la hidratación mantienen su capacidad para el regreso.",
  },
  imm: {
    n: "Defensas e inmunidad",
    x: 90,
    y: 158,
    col: "R",
    c: "La radiación, el estrés y el mal sueño deprimen tus defensas y reactivan virus latentes. Reduce la dosis, duerme y vigila piel y temperatura.",
  },
  bon: {
    n: "Huesos y músculo",
    x: 69,
    y: 278,
    col: "R",
    c: "Sin carga pierdes cerca de 1,5 % de hueso de cadera al mes. El ejercicio de resistencia frena la mayor parte; cada sesión perdida cuenta.",
  },
};
const SYM = [
  ["cefalea", "Dolor de cabeza"],
  ["vision", "Visión borrosa"],
  ["palp", "Palpitaciones"],
  ["lumbar", "Dolor lumbar"],
  ["piel", "Erupción en la piel"],
  ["congestion", "Congestión"],
  ["nausea", "Náusea"],
];
const VIT = [
  {
    k: "hr",
    n: "Frecuencia cardíaca",
    u: "lpm",
    lo: 45,
    hi: 90,
    d: 0,
    wide: 1,
  },
  { k: "hrv", n: "Variabilidad cardíaca", u: "ms", lo: 40, hi: 999, d: 0 },
  { k: "spo2", n: "Oxígeno en sangre", u: "%", lo: 95, hi: 101, d: 1 },
  { k: "sys", n: "Presión arterial", u: "mmHg", lo: 95, hi: 132, d: 0 },
  { k: "temp", n: "Temperatura", u: "°C", lo: 36, hi: 37.5, d: 1 },
  { k: "co2", n: "CO₂ en cabina", u: "mmHg", lo: 0, hi: 4, d: 1 },
  { k: "dose", n: "Radiación ahora", u: "mSv/día", lo: 0, hi: 3, d: 1 },
  { k: "cum", n: "Radiación acumulada", u: "de 600 mSv", lo: 0, hi: 480, d: 0 },
  { k: "bone", n: "Densidad ósea", u: "% de base", lo: 93, hi: 101, d: 1 },
  { k: "sleep", n: "Sueño de anoche", u: "h", lo: 6.5, hi: 12, d: 1 },
];
