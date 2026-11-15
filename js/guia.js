function construirGuia() {
  const hz = $("#hazards");
  for (const k in PELIGROS) {
    const p = PELIGROS[k];
    const c = el("div", "hz");
    c.append(el("h3", "", p.n), el("p", "", p.t));
    const ch = el("div", "chips");
    for (const z in ZONAS)
      if (ZONAS[z].pel.includes(k)) {
        const b = el("button", "chipbtn", ZONAS[z].n);
        b.type = "button";
        b.onclick = () => {
          S.sel = z;
          location.hash = "panel";
          pintar();
        };
        ch.append(b);
      }
    c.append(ch);
    hz.append(c);
  }
  const tb = $("#indTable tbody");
  for (const k in IND) {
    const d = IND[k];
    const tr = el("tr");
    tr.append(
      el("td", "n", d.n),
      el("td", "", ZONAS[d.z].n),
      el("td", "lv0", d.rango[0] + " " + d.u),
      el("td", "lv1", d.rango[1]),
      el("td", "lv2", d.rango[2]),
      el("td", "", d.como[0])
    );
    tb.append(tr);
  }
  const ld = $("#ladderGuide");
  ESCALERA.forEach((e, i) => {
    const li = el("li");
    const txt = [
      "Todos tus indicadores están en verde. Sigue la rutina y tus misiones del día.",
      "Al menos un indicador o síntoma está en ámbar. Haz la acción que propone Centinela y vuelve a medir.",
      "Un indicador está en rojo. Avisa al oficial médico de la tripulación y sigue la acción ahora.",
      "Dos o más valores en rojo, o uno crítico (oxígeno, corazón, presión, falta de aire, palpitaciones o visión). Envía el informe a los cirujanos de vuelo: la respuesta tarda minutos, así que actúa mientras llega.",
    ][i];
    li.append(el("strong", "", e.n + ". "), document.createTextNode(txt));
    ld.append(li);
  });
  const sl = $("#srcs");
  for (const [t, u] of FUENTES) {
    const li = el("li");
    const a = el("a", "", t);
    a.href = u;
    a.target = "_blank";
    a.rel = "noopener";
    li.append(a);
    sl.append(li);
  }
}
