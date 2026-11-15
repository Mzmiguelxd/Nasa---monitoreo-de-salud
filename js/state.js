const CLAVE = "centinela-v2";
const disco = {
  leer() {
    try {
      return JSON.parse(localStorage.getItem(CLAVE)) || {};
    } catch (e) {
      return {};
    }
  },
  guardar() {
    try {
      localStorage.setItem(
        CLAVE,
        JSON.stringify({
          dia: PLAN.hoy,
          regBase: S.regBase,
          sintBase: S.sintBase,
          mis: S.mis,
          xpAcc: S.xpAcc,
          log: S.log,
          camOk: S.camOk,
          escudo: S.escudo,
          mejorReac: S.mejorReac,
          proj: S.proj,
          sonido: S.sonido,
        })
      );
    } catch (e) {}
  },
};

function tasaRad(dia) {
  return dia <= PLAN.ida || dia > PLAN.ida + PLAN.superficie ? 1.84 : 0.64;
}
function gravedadDia(dia) {
  return dia <= PLAN.ida || dia > PLAN.ida + PLAN.superficie ? 0 : 0.38;
}
function perdidaMes(g, adh) {
  return 1.25 * (1 - g) * (1 - 0.6 * adh);
}
function modelo(adh, refugio, tormentas, desde = 0) {
  const hueso = [],
    dosis = [];
  let b = 100,
    c = 0;
  const factor = 1 - (0.3 * (refugio - 8)) / 8;
  const restantes = PLAN.total - PLAN.hoy;
  for (let d = 0; d <= PLAN.total; d++) {
    if (d > 0) {
      const futuro = d > PLAN.hoy;
      const a = futuro ? adh : 0.8;
      b -= perdidaMes(gravedadDia(d), a) / 30;
      c += tasaRad(d) * (futuro ? factor : 1) + (futuro ? (tormentas * 25) / restantes : 0);
    }
    if (d % 5 === 0 || d === PLAN.hoy || d === PLAN.total) {
      hueso.push([d, b]);
      dosis.push([d, c]);
    }
  }
  return { hueso, dosis };
}
const BASE_HOY = modelo(0.8, 8, 0);
const valorEn = (serie, dia) => serie.reduce((a, p) => (p[0] <= dia ? p[1] : a), serie[0][1]);

const guardado = disco.leer();
const mismoDia = guardado.dia === PLAN.hoy;

const S = {
  env: "base",
  escenario: "nominal",
  sel: "corazon",
  v: {
    fc: 63,
    vfc: 56,
    spo2: 97.6,
    temp: 36.7,
    co2: ENTORNOS.base.co2,
    dosis: 0.64,
  },
  acum: valorEn(BASE_HOY.dosis, PLAN.hoy),
  osea: valorEn(BASE_HOY.hueso, PLAN.hoy),
  regBase:
    (mismoDia && guardado.regBase) || {
      pas: 118,
      pad: 76,
      glu: 91,
      sueno: 6.4,
      animo: 4,
      estres: 2,
      ejer: 45,
      hora: "07:40",
    },
  regEsc: {},
  sintBase: (mismoDia && guardado.sintBase) || [],
  sintEsc: [],
  man: {},
  hecho: {},
  mis: (mismoDia && guardado.mis) || {},
  xpBase: 520,
  xpAcc: (mismoDia && guardado.xpAcc) || 0,
  racha: 11,
  log: guardado.log || [],
  camOk: !!guardado.camOk,
  escudo: !!guardado.escudo,
  mejorReac: guardado.mejorReac || null,
  proj: guardado.proj || { adh: 80, ref: 8, tor: 1 },
  sonido: guardado.sonido ?? true,
  nivelPrev: 0,
  h: {},
};

function reg() {
  return { ...S.regBase, ...S.regEsc };
}
function sintomas() {
  return [...new Set([...S.sintBase, ...S.sintEsc])];
}
function valor(k) {
  const m = S.man[k];
  if (m && Date.now() - m.ts < 30 * 60000) return m.v;
  if (k in S.v) return S.v[k];
  if (k === "acum") return S.acum;
  if (k === "osea") return S.osea;
  const r = reg();
  return r[k] ?? null;
}
function origen(k) {
  const m = S.man[k];
  if (m && Date.now() - m.ts < 30 * 60000) return "Manual " + m.hora;
  const f = IND[k].fuente;
  if (f === "sensor") return "Sensor en vivo";
  if (f === "calculo") return "Estimado";
  if (f === "prueba") return S.regBase.reac ? "Prueba " + (S.regBase.horaReac || "") : "Sin prueba hoy";
  return reg()[k] != null ? "Registro " + (S.regBase.hora || "") : "Sin registro";
}

const HIST = (() => {
  const r = semilla(214),
    n = (c, s) => c + (r() + r() + r() - 1.5) * s;
  const h = {};
  const dias = Array.from({ length: 30 }, (_, i) => PLAN.hoy - 29 + i);
  h.dias = dias;
  h.fc = dias.map((d) => n(62, 2.2));
  h.vfc = dias.map((d, i) => n(i > 22 ? 47 : 56, 4));
  h.pas = dias.map((d, i) => n(114 + i * 0.12, 3));
  h.pad = dias.map((d) => n(74, 2.5));
  h.spo2 = dias.map((d) => clamp(n(97.6, 0.5), 94, 100));
  h.temp = dias.map((d) => n(36.7, 0.12));
  h.glu = dias.map((d) => n(88, 5));
  h.co2 = dias.map((d) => n(2.7, 0.2));
  h.dosis = dias.map((d) => (d === 197 ? 9.4 : d === 198 ? 3.1 : n(tasaRad(d), 0.05)));
  h.acum = dias.map((d) => valorEn(BASE_HOY.dosis, d));
  h.sueno = dias.map((d, i) => clamp(n(i > 22 ? 6.5 : 7.3, 0.35), 3, 10));
  h.animo = dias.map((d, i) => Math.round(clamp(n(i > 24 ? 3.4 : 4, 0.5), 1, 5)));
  h.estres = dias.map((d, i) => Math.round(clamp(n(i > 24 ? 2.8 : 2, 0.5), 1, 5)));
  h.reac = dias.map((d, i) => n(i > 22 ? 318 : 292, 14));
  h.osea = dias.map((d) => valorEn(BASE_HOY.hueso, d));
  h.ejer = dias.map((d, i) => Math.round(clamp(n(i % 9 === 4 ? 95 : 152, 8), 0, 220)));
  return h;
})();

function serie(k) {
  const s = HIST[k].slice(0, 29);
  const v = valor(k);
  return [...s, v ?? HIST[k][29]];
}
