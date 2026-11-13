let sample = null,
  tts = null,
  actx = null;
(async () => {
  try {
    if (window.claude && window.claude.use) {
      sample = await window.claude.use("sample");
      tts = await window.claude.use("tts");
    }
  } catch (e) {}
  $("#aiLead").textContent = sample
    ? "Pregunta con tus datos de este momento. Responde Claude con tus indicadores en vivo; si falla el enlace, toma el relevo el motor de reglas local."
    : "Asistente no disponible en esta vista. Responde el motor de reglas local, que funciona sin enlace.";
})();

function beep() {
  if (!S.sound) return;
  try {
    actx = actx || new (window.AudioContext || window.webkitAudioContext)();
    [0, 0.22, 0.44].forEach((o) => {
      const os = actx.createOscillator(),
        g = actx.createGain();
      os.frequency.value = 880;
      os.connect(g);
      g.connect(actx.destination);
      g.gain.setValueAtTime(0.12, actx.currentTime + o);
      g.gain.exponentialRampToValueAtTime(0.001, actx.currentTime + o + 0.16);
      os.start(actx.currentTime + o);
      os.stop(actx.currentTime + o + 0.18);
    });
  } catch (e) {}
}
function say(t) {
  if (!S.sound) return;
  if (tts) {
    tts.speak(t, { language: "es" }).catch(() => {});
    return;
  }
  try {
    const u = new SpeechSynthesisUtterance(t);
    u.lang = "es-ES";
    speechSynthesis.cancel();
    speechSynthesis.speak(u);
  } catch (e) {}
}
