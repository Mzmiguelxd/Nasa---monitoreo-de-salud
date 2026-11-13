const KEY = "centinela-v1";
const disk = {
  load() {
    try {
      return JSON.parse(localStorage.getItem(KEY)) || {};
    } catch (e) {
      return {};
    }
  },
  save() {
    try {
      localStorage.setItem(
        KEY,
        JSON.stringify({
          checkin: S.checkin,
          pvt: S.pvt,
          log: S.log,
          exMin: S.exMin,
          proj: S.proj,
          sound: S.sound,
        }),
      );
    } catch (e) {}
  },
};
const saved = disk.load();

const S = {
  day: 214,
  total: 520,
  scenario: "nominal",
  sel: "car",
  v: { ...BASE, cum: 235, bone: 96.2, sleep: 7.4 },
  h: {},
  done: {},
  prev: {},
  checkin: saved.checkin || null,
  pvt: saved.pvt || null,
  log: saved.log || [],
  exMin: saved.exMin ?? 90,
  proj: saved.proj || { adh: 80, shel: 8, storm: 1 },
  sound: saved.sound ?? true,
};
VIT.forEach((d) => (S.h[d.k] = []));

function sleepNow() {
  return SCN[S.scenario].sleep ?? (S.checkin ? S.checkin.sleep : 7.4);
}
function targets() {
  const t = { ...BASE, ...SCN[S.scenario].t };
  if (S.done.refugio) t.dose = Math.min(t.dose, 2.6);
  if (S.done.co2) {
    t.co2 = 3;
    t.spo2 = 97.4;
  }
  if (S.done.reposo) {
    t.hr = Math.min(t.hr, 82);
    t.hrv = Math.max(t.hrv, 40);
    t.sys = Math.min(t.sys, 127);
    t.dia = Math.min(t.dia, 80);
  }
  return t;
}
function has(s) {
  return !!(S.checkin && S.checkin.sym.includes(s));
}
