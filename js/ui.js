function log(t) {
  const d = new Date();
  S.log.unshift({
    d: S.day,
    h:
      String(d.getHours()).padStart(2, "0") +
      ":" +
      String(d.getMinutes()).padStart(2, "0"),
    t,
  });
  S.log = S.log.slice(0, 60);
  disk.save();
  renderLog();
}
function toast(t) {
  const e = $("#toast");
  e.textContent = t;
  e.classList.add("on");
  clearTimeout(toast.t);
  toast.t = setTimeout(() => e.classList.remove("on"), 2200);
}

const cards = {};
function build() {
  $("#total").textContent = S.total;
  $("#day").textContent = S.day;
  const p = (S.day / S.total) * 100;
  $("#trackFill").style.width = p + "%";
  $("#ship").style.left = p + "%";
  const dm = (4 + 16 * Math.sin((Math.PI * S.day) / S.total)) * 2,
    mm = Math.floor(dm),
    ss = Math.round((dm - mm) * 60);
  $("#delay").textContent = mm + " min " + ss + " s";
  const og = $("#organs");
  for (const k in SYS) {
    const s = SYS[k],
      b = el("button", "sys");
    b.setAttribute("aria-pressed", "false");
    const n = el("span", "n", s.n),
      sc = el("span", "s"),
      l = el("span", "l"),
      f = el("span", "f");
    b.append(n, sc, l, f);
    b.onclick = () => {
      S.sel = k;
      render();
    };
    $(s.col === "L" ? "#colL" : "#colR").append(b);
    const g = document.createElementNS("http://www.w3.org/2000/svg", "g");
    g.setAttribute("class", "org");
    g.setAttribute("tabindex", "0");
    g.setAttribute("role", "button");
    g.setAttribute("aria-label", s.n);
    g.innerHTML =
      '<circle class="r" cx="' +
      s.x +
      '" cy="' +
      s.y +
      '" r="15"/><circle class="d" cx="' +
      s.x +
      '" cy="' +
      s.y +
      '" r="10"/>';
    g.onclick = () => {
      S.sel = k;
      render();
    };
    g.onkeydown = (e) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        S.sel = k;
        render();
      }
    };
    og.append(g);
    cards[k] = { b, sc, l, f, g };
  }
  const vt = $("#vitals");
  VIT.forEach((d) => {
    const t = el("div", "vit" + (d.wide ? " wide" : ""));
    d.ev = el("div", "v");
    d.es = el("div", "st");
    t.append(el("div", "n", d.n), d.ev, d.es);
    if (d.k === "hr") {
      const c = document.createElement("canvas");
      c.id = "ecg";
      c.setAttribute("aria-hidden", "true");
      t.append(c);
    } else {
      t.insertAdjacentHTML(
        "beforeend",
        '<svg viewBox="0 0 100 28" preserveAspectRatio="none" aria-hidden="true"><polyline/></svg>',
      );
      d.pl = $("polyline", t);
    }
    vt.append(t);
  });
  const sc = $("#scn");
  for (const k in SCN) {
    const b = el("button", "btn ghost", SCN[k].n);
    b.dataset.k = k;
    b.onclick = () => {
      S.scenario = k;
      const ex = S.done.ejercicio;
      S.done = ex ? { ejercicio: true } : {};
      S.v.sleep = sleepNow();
      log("Simulación: " + SCN[k].n.toLowerCase());
      render();
    };
    sc.append(b);
  }
  const sy = $("#sym");
  SYM.forEach(([k, n]) => {
    const b = el("button", "chip", n);
    b.dataset.k = k;
    b.setAttribute("aria-pressed", has(k) ? "true" : "false");
    b.onclick = () =>
      b.setAttribute(
        "aria-pressed",
        b.getAttribute("aria-pressed") === "true" ? "false" : "true",
      );
    sy.append(b);
  });
  const c = S.checkin || { mood: 4, stress: 2, sleep: 7.5 };
  $("#mood").value = c.mood;
  $("#stress").value = c.stress;
  $("#sleep").value = c.sleep;
  ["mood", "stress", "sleep"].forEach((i) => ($("#" + i).oninput = outs));
  outs();
  $("#adh").value = S.proj.adh;
  $("#shel").value = S.proj.shel;
  $("#storm").value = S.proj.storm;
  ["adh", "shel", "storm"].forEach(
    (i) =>
      ($("#" + i).oninput = () => {
        S.proj = {
          adh: +$("#adh").value,
          shel: +$("#shel").value,
          storm: +$("#storm").value,
        };
        disk.save();
        project();
      }),
  );
  [
    "¿Qué debo vigilar hoy?",
    "Explícame mi riesgo más alto",
    "Redacta mi informe médico para Tierra",
  ].forEach((q) => {
    const b = el("button", "chip", q);
    b.onclick = () => ask(q);
    $("#quick").append(b);
  });
  S.v.sleep = sleepNow();
  setSound();
}
function outs() {
  const M = ["", "Muy bajo", "Bajo", "Regular", "Bueno", "Muy bueno"],
    T = ["", "Mínimo", "Leve", "Moderado", "Alto", "Muy alto"];
  $("#oMood").textContent = M[$("#mood").value];
  $("#oStress").textContent = T[$("#stress").value];
  $("#oSleep").textContent = nf($("#sleep").value, 1) + " h";
}
function setSound() {
  const b = $("#sound");
  b.setAttribute("aria-pressed", S.sound);
  b.textContent = S.sound ? "Voz y sonido activados" : "Voz y sonido apagados";
}

let actSig = "";
function render() {
  const R = risks(),
    v = S.v;
  for (const k in cards) {
    const c = cards[k],
      r = R[k];
    c.sc.textContent = r.score;
    c.sc.className = "s lv" + r.lv;
    c.l.textContent = LV[r.lv];
    c.l.className = "l lv" + r.lv;
    c.f.textContent = r.f[0] ? r.f[0][0] : "Sin factores destacables";
    c.b.setAttribute("aria-pressed", S.sel === k ? "true" : "false");
    c.g.setAttribute("class", "org lv" + r.lv + (S.sel === k ? " sel" : ""));
    if (r.lv === 2 && (S.prev[k] ?? 0) < 2) raise(k, R);
    S.prev[k] = r.lv;
  }
  const sel = R[S.sel];
  $("#detName").textContent =
    SYS[S.sel].n + ": por qué " + sel.score + " de 100";
  const fl = $("#factors");
  fl.textContent = "";
  sel.f.slice(0, 5).forEach(([t, p]) => {
    const li = el("li");
    li.append(el("span", "", t));
    const b = el("div", "bar"),
      i = el("i");
    i.style.width = clamp(p * 2.2) + "%";
    b.append(i);
    li.append(b);
    fl.append(li);
  });
  if (!sel.f.length)
    fl.append(el("li", "empty", "Ningún factor suma riesgo ahora."));
  $("#counter").textContent = SYS[S.sel].c;
  const A = actions(R),
    sig = A.map((a) => a.id + a.t).join("|");
  if (sig !== actSig) {
    actSig = sig;
    const ul = $("#acts");
    ul.textContent = "";
    if (!A.length)
      ul.append(
        el(
          "li",
          "",
          "Todo al día. Los sensores siguen vigilando y te avisarán si algo cambia.",
        ),
      );
    A.forEach((a) => {
      const li = el("li", "u" + a.u),
        d = el("div");
      d.append(el("strong", "", a.t), el("small", "", a.w));
      const b = el("button", "btn" + (a.u ? "" : " ghost"), a.b);
      b.onclick =
        a.fn ||
        (() => {
          S.done[a.id] = true;
          if (a.id === "ejercicio") {
            S.exMin = 150;
          }
          log("Acción: " + a.t.toLowerCase());
          disk.save();
          toast("Acción registrada");
          render();
        });
      li.append(d, b);
      ul.append(li);
    });
  }
  VIT.forEach((d) => {
    const x = v[d.k],
      ok = x >= d.lo && x <= d.hi;
    d.ev.textContent = d.k === "sys" ? nf(v.sys) + "/" + nf(v.dia) : nf(x, d.d);
    d.ev.append(el("small", "", d.u));
    d.es.textContent = ok ? "En rango" : x < d.lo ? "Bajo" : "Alto";
    d.es.className = "st " + (ok ? "lv0" : "lv2");
    if (d.pl) {
      const h = S.h[d.k];
      if (h.length > 1) {
        const mn = Math.min(...h),
          mx = Math.max(...h),
          sp = mx - mn || 1;
        d.pl.setAttribute(
          "points",
          h
            .map(
              (y, i) =>
                ((i / (h.length - 1)) * 100).toFixed(1) +
                "," +
                (25 - ((y - mn) / sp) * 22).toFixed(1),
            )
            .join(" "),
        );
      }
    }
  });
  document
    .querySelectorAll("#scn button")
    .forEach((b) =>
      b.setAttribute(
        "aria-pressed",
        b.dataset.k === S.scenario ? "true" : "false",
      ),
    );
}
function raise(k, R) {
  const a = actions(R).find((x) => x.u === 2);
  const t =
    SYS[k].n +
    " en nivel de actuar. " +
    (a ? a.t + "." : "Revisa los factores y sigue la contramedida.");
  $("#alertText").textContent = t;
  $("#alert").classList.add("on");
  log("Alerta: " + SYS[k].n.toLowerCase() + " en " + R[k].score + " de 100");
  S.sel = k;
  beep();
  say(t);
}

function renderLog() {
  const ul = $("#log");
  ul.textContent = "";
  if (!S.log.length) {
    ul.append(
      el(
        "li",
        "empty",
        "Aún no hay registros. Guarda tu primer chequeo o haz la prueba de reflejos.",
      ),
    );
    return;
  }
  S.log.forEach((x) => {
    const li = el("li");
    li.append(el("span", "", "D" + x.d + " " + x.h), el("div", "", x.t));
    ul.append(li);
  });
}
