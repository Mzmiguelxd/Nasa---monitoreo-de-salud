const VISTAS = ["panel", "registro", "tendencias", "misiones", "guia", "medico"];

function vistaActual() {
  const h = location.hash.slice(1);
  return VISTAS.includes(h) ? h : "panel";
}

function ruta() {
  const v = vistaActual();
  $$(".view").forEach((s) => s.classList.toggle("on", s.dataset.view === v));
  $$("nav a").forEach((a) => (a.getAttribute("href") === "#" + v ? a.setAttribute("aria-current", "page") : a.removeAttribute("aria-current")));
  if (v !== "registro" && cam.on) pararPulso("Medición detenida al cambiar de sección.");
  pintar();
  window.scrollTo(0, 0);
}

function pintar() {
  const E = evaluar();
  alertar(E);
  pintarPanel(E);
  pintarMisiones();
  const v = vistaActual();
  if (v === "tendencias") pintarTendencias();
}

function sonidoBtn() {
  const b = $("#sound");
  b.setAttribute("aria-pressed", S.sonido ? "true" : "false");
  b.textContent = S.sonido ? "Sonido activado" : "Sonido apagado";
}

function tic() {
  paso();
  for (const k in S.v) {
    const h = (S.h[k] = S.h[k] || []);
    h.push(S.v[k]);
    if (h.length > 40) h.shift();
  }
  pintar();
}

construirPanel();
construirRegistro();
construirTendencias();
construirMisiones();
construirGuia();
construirAsistente();
pintarBitacora();
for (let i = 0; i < 40; i++) tic();
sonidoBtn();
ruta();
setInterval(tic, 1000);
requestAnimationFrame(dibujarEcg);
window.addEventListener("hashchange", ruta);
window.addEventListener("resize", () => vistaActual() === "tendencias" && pintarTendencias());
matchMedia("(prefers-color-scheme: dark)").addEventListener("change", () => vistaActual() === "tendencias" && pintarTendencias());
new MutationObserver(() => vistaActual() === "tendencias" && pintarTendencias()).observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme"] });
$("#alertOk").onclick = () => $("#alert").classList.remove("on");
$("#sound").onclick = () => {
  S.sonido = !S.sonido;
  sonidoBtn();
  disco.guardar();
  if (!S.sonido) callar();
};
