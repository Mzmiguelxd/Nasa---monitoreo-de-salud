function misionHecha(id) {
  const r = reg();
  if (id === "vitales") return r.pas != null && r.glu != null && r.sueno != null && !!S.regBase.hora;
  if (id === "pulso") return !!S.mis.pulso;
  if (id === "reflejos") return !!S.mis.reflejos;
  if (id === "ejercicio") return (r.ejer ?? 0) >= 150;
  if (id === "sueno") return (r.sueno ?? 0) >= 7;
  return !!S.mis[id];
}

function xpTotal() {
  return S.xpBase + S.xpAcc + MISIONES.filter((m) => misionHecha(m.id)).reduce((a, m) => a + m.xp, 0);
}
function rachaHoy() {
  return S.racha + (misionHecha("vitales") ? 1 : 0);
}

function seguidos(k, cond) {
  const s = serie(k);
  let n = 0;
  for (let i = s.length - 1; i >= 0 && cond(s[i]); i--) n++;
  return n;
}

function insignias() {
  const ej = seguidos("ejer", (v) => v >= 150),
    su = seguidos("sueno", (v) => v >= 7);
  return [
    { s: "7", n: "Semana constante", d: "Registra tus signos 7 días seguidos", p: rachaHoy(), m: 7 },
    { s: "30", n: "Centinela del mes", d: "Registra tus signos 30 días seguidos", p: rachaHoy(), m: 30 },
    { s: "H", n: "Huesos de acero", d: "7 días seguidos con 150 min de ejercicio", p: ej, m: 7 },
    { s: "Z", n: "Buen dormir", d: "5 noches seguidas de 7 h o más", p: su, m: 5 },
    { s: "P", n: "Primer pulso", d: "Mide tu pulso con la cámara", p: S.camOk ? 1 : 0, m: 1 },
    { s: "R", n: "Reflejos de piloto", d: "Tiempo de reacción de 300 ms o menos", p: S.mejorReac && S.mejorReac <= 300 ? 1 : 0, m: 1 },
    { s: "E", n: "Escudo solar", d: "Entra al refugio durante una tormenta solar", p: S.escudo ? 1 : 0, m: 1 },
  ];
}

function construirMisiones() {
  const ul = $("#tasks");
  for (const m of MISIONES) {
    const li = el("li");
    li.dataset.k = m.id;
    const b = el("button", "tick", "");
    b.type = "button";
    b.setAttribute("aria-label", m.n);
    b.onclick = () => {
      if (m.auto) {
        location.hash = "registro";
        return;
      }
      S.mis[m.id] = !S.mis[m.id];
      if (S.mis[m.id]) {
        anotar("Misión cumplida: " + m.n.toLowerCase());
        toast("+" + m.xp + " XP");
      }
      disco.guardar();
      pintar();
    };
    const d = el("div");
    d.append(el("strong", "", m.n), el("small", "", m.d + (m.auto ? ". Se marca sola al registrarlo." : "")));
    li.append(b, d, el("span", "xpv", "+" + m.xp + " XP"));
    ul.append(li);
  }
}

function pintarMisiones() {
  const xp = xpTotal(),
    nivel = Math.floor(xp / 250) + 1,
    dentro = xp % 250;
  $("#lvlChip").textContent = "Nivel " + nivel + " · " + xp + " XP";
  $("#streakChip").textContent = "Racha de " + rachaHoy() + " días";
  $("#xpNivel").textContent = "Nivel " + nivel;
  $("#xpTxt").textContent = dentro + " de 250 XP para el nivel " + (nivel + 1);
  $("#xpBar").style.width = (dentro / 250) * 100 + "%";
  const hechas = MISIONES.filter((m) => misionHecha(m.id)).length;
  $("#misCount").textContent = hechas + " de " + MISIONES.length + " misiones de hoy";
  $$("#tasks li").forEach((li) => {
    const ok = misionHecha(li.dataset.k);
    li.classList.toggle("done", ok);
    $(".tick", li).textContent = ok ? "✓" : "";
  });
  const ul = $("#badges");
  ul.textContent = "";
  for (const b of insignias()) {
    const got = b.p >= b.m;
    const li = el("li", got ? "got" : "");
    li.innerHTML = '<svg class="emb" viewBox="0 0 42 42" aria-hidden="true"><polygon points="21,2 38,11.5 38,30.5 21,40 4,30.5 4,11.5"/><text x="21" y="26" text-anchor="middle"></text></svg>';
    $("text", li).textContent = b.s;
    li.append(el("strong", "", b.n), el("small", "", b.d));
    if (!got && b.m > 1) {
      const pr = el("div", "prog"),
        i = el("i");
      i.style.width = (Math.min(b.p, b.m) / b.m) * 100 + "%";
      pr.append(i);
      li.append(pr, el("small", "", Math.min(b.p, b.m) + " de " + b.m));
    } else li.append(el("small", "", got ? "Conseguida" : "Pendiente"));
    ul.append(li);
  }
}
