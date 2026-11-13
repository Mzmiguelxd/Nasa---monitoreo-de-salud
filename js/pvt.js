const P = { st: "idle", n: 0, rts: [], t0: 0, tm: null };
function pvtNext() {
  P.st = "wait";
  const p = $("#pad");
  p.className = "pad wait";
  p.textContent = "Espera el verde…";
  P.tm = setTimeout(
    () => {
      P.st = "go";
      P.t0 = performance.now();
      p.className = "pad go";
      p.textContent = "¡Ahora!";
    },
    1500 + Math.random() * 3000,
  );
}
function pvtHit() {
  const p = $("#pad");
  if (P.st === "idle") {
    P.n = 0;
    P.rts = [];
    $("#pvtRes").textContent = "";
    pvtNext();
    return;
  }
  if (P.st === "wait") {
    clearTimeout(P.tm);
    p.textContent = "Demasiado pronto. Va de nuevo…";
    P.st = "pause";
    setTimeout(pvtNext, 900);
    return;
  }
  if (P.st === "go") {
    const rt = performance.now() - P.t0;
    P.rts.push(rt);
    P.n++;
    if (P.n < 5) {
      p.className = "pad wait";
      p.textContent = nf(rt) + " ms";
      P.st = "pause";
      setTimeout(pvtNext, 700);
      return;
    }
    const m = P.rts.reduce((a, b) => a + b, 0) / 5,
      lap = P.rts.filter((x) => x > 500).length;
    S.pvt = { rt: Math.round(m), lap, day: S.day };
    P.st = "idle";
    p.className = "pad";
    p.textContent = "Repetir prueba";
    $("#pvtRes").textContent =
      "Media de " +
      nf(m) +
      " ms con " +
      lap +
      (lap === 1 ? " lapso" : " lapsos") +
      " de más de 500 ms. " +
      (m < 330 && !lap
        ? "Estás alerta."
        : m < 420
          ? "Algo de fatiga: evita tareas críticas largas sin pausa."
          : "Fatiga marcada: pospón maniobras críticas y descansa.");
    log("Reflejos: " + nf(m) + " ms de media, " + lap + " lapsos");
    disk.save();
    render();
  }
}
