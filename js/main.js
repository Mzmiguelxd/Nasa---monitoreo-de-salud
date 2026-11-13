function route() {
  const names = ["estado", "chequeo", "proyeccion", "medico"],
    h = location.hash.slice(1),
    v = names.includes(h) ? h : "estado";
  document
    .querySelectorAll(".view")
    .forEach((s) => s.classList.toggle("on", s.dataset.view === v));
  document
    .querySelectorAll("nav a")
    .forEach((a) =>
      a.getAttribute("href") === "#" + v
        ? a.setAttribute("aria-current", "page")
        : a.removeAttribute("aria-current"),
    );
  if (v === "proyeccion") project();
}

build();
renderLog();
route();
for (let i = 0; i < 40; i++) {
  const t = targets();
  for (const k in BASE)
    S.v[k] += (t[k] - S.v[k]) * 0.2 + (Math.random() - 0.5) * NOISE[k];
  VIT.forEach((d) => S.h[d.k].push(S.v[d.k]));
}
render();
setInterval(tick, 1000);
if (matchMedia("(prefers-reduced-motion: reduce)").matches) {
  for (let i = 0; i < 600; i++) ecg.buf.push(wave((i / 170) % 1));
  ecg.last = 0;
}
requestAnimationFrame(drawEcg);
window.addEventListener("hashchange", route);
window.addEventListener("resize", () => {
  if ($('[data-view="proyeccion"]').classList.contains("on")) project();
});
matchMedia("(prefers-color-scheme: dark)").addEventListener("change", () => {
  if ($('[data-view="proyeccion"]').classList.contains("on")) project();
});
new MutationObserver(() => {
  if ($('[data-view="proyeccion"]').classList.contains("on")) project();
}).observe(document.documentElement, {
  attributes: true,
  attributeFilter: ["data-theme"],
});
$("#alertOk").onclick = () => $("#alert").classList.remove("on");
$("#sound").onclick = () => {
  S.sound = !S.sound;
  setSound();
  disk.save();
  if (!S.sound) {
    if (tts) tts.stop();
    try {
      speechSynthesis.cancel();
    } catch (e) {}
  }
};
$("#pad").addEventListener("pointerdown", (e) => {
  e.preventDefault();
  pvtHit();
});
$("#pad").addEventListener("keydown", (e) => {
  if (e.key === " " || e.key === "Enter") {
    e.preventDefault();
    pvtHit();
  }
});
$("#saveCheck").onclick = () => {
  const sym = [...document.querySelectorAll("#sym [aria-pressed='true']")].map(
    (b) => b.dataset.k,
  );
  S.checkin = {
    mood: +$("#mood").value,
    stress: +$("#stress").value,
    sleep: +$("#sleep").value,
    sym,
    day: S.day,
  };
  S.v.sleep = sleepNow();
  delete S.done.vision;
  delete S.done.animo;
  log(
    "Chequeo: ánimo " +
      S.checkin.mood +
      "/5, estrés " +
      S.checkin.stress +
      "/5, sueño " +
      nf(S.checkin.sleep, 1) +
      " h" +
      (sym.length
        ? ", síntomas: " +
          sym
            .map((k) => SYM.find((x) => x[0] === k)[1].toLowerCase())
            .join(", ")
        : ""),
  );
  toast("Chequeo guardado");
  render();
};
$("#ask").onclick = () => ask($("#q").value);
$("#q").addEventListener("keydown", (e) => {
  if (e.key === "Enter") ask($("#q").value);
});
