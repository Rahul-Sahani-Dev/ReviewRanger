// primer.js
// Builds the optional "Reading code changes 101" screen from content.js.

export function buildPrimer(primer, onContinue) {
  const wrap = document.createElement("section");
  wrap.className = "primer screen";
  wrap.setAttribute("aria-labelledby", "primer-title");

  const h = document.createElement("h2");
  h.id = "primer-title";
  h.tabIndex = -1;
  h.textContent = primer.title;
  wrap.appendChild(h);

  const intro = document.createElement("p");
  intro.className = "lead";
  intro.textContent = primer.intro;
  wrap.appendChild(intro);

  primer.sections.forEach((s) => {
    const card = document.createElement("div");
    card.className = "primer-card";
    const sh = document.createElement("h3");
    sh.textContent = s.heading;
    const sb = document.createElement("p");
    sb.textContent = s.body;
    card.append(sh, sb);
    wrap.appendChild(card);
  });

  const closing = document.createElement("p");
  closing.className = "primer-closing";
  closing.textContent = primer.closing;
  wrap.appendChild(closing);

  const done = document.createElement("button");
  done.className = "btn btn-primary";
  done.type = "button";
  done.textContent = primer.doneLabel;
  done.addEventListener("click", onContinue);
  wrap.appendChild(done);

  return wrap;
}
