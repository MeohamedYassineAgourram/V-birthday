/* The journey board — a Vision-Pro style deck of country cards.
   A big focused card in the middle, a filmstrip of all five below. */
Game.scenes.journey = (stage) => {
  const target = Game.nextCountry() || COUNTRIES[COUNTRIES.length - 1];
  let focus = target.id;

  const view = el(`<section class="journey enter">
    <div class="j-head">
      <div class="eyebrow"><span class="dot-live"></span> The journey · ${Game.lit} of ${COUNTRIES.length} cleared</div>
      <h1 class="j-title">The route is yours to unlock</h1>
    </div>

    <div class="deck" id="deck"></div>

    <div class="filmstrip" id="strip"></div>
  </section>`);
  stage.appendChild(view);

  const deck = view.querySelector("#deck");
  const strip = view.querySelector("#strip");

  const render = () => {
    const c = byId(focus);
    const done = Game.done.has(c.id);
    const open = Game.unlocked(c.id);
    const idx = COUNTRIES.indexOf(c) + 1;

    deck.innerHTML = "";
    const card = el(`<article class="dcard ${done ? "done" : ""} ${open ? "" : "locked"}" style="--c:${c.tint}">
      <div class="dcard-img" style="background-image:url('img/loc/${c.id}_card.jpg')"></div>
      <div class="dcard-glass">
        <div class="dcard-top">
          <span class="dcard-flag">${c.flag}</span>
          <span class="dcard-step">${c.code} · stop ${idx} / ${COUNTRIES.length}</span>
          ${done ? `<span class="dcard-check">✓ cleared</span>`
                 : open ? "" : `<span class="dcard-lock">🔒 locked</span>`}
        </div>
        <div class="dcard-body">
          <div class="dcard-city">${c.flag} ${c.city}</div>
          <h2 class="dcard-name">${c.name}</h2>
          <p class="dcard-brief">${c.brief}</p>
          <div class="cta-row" style="justify-content:flex-start;margin-top:16px">
            ${open
              ? `<button class="btn glow" id="go">${done ? "Replay" : (c.finale ? "Arrive in Paris" : "Begin mission")} <span>→</span></button>`
              : `<button class="btn ghost" disabled>Clear the earlier stops first</button>`}
          </div>
        </div>
      </div>
    </article>`);
    deck.appendChild(card);
    const go = card.querySelector("#go");
    if (go) go.onclick = () => { Game.audio(); Game.sfx("good"); Game.travel(c.id); };

    strip.querySelectorAll(".thumb").forEach(t =>
      t.classList.toggle("on", t.dataset.id === focus));
  };

  COUNTRIES.forEach(c => {
    const done = Game.done.has(c.id), open = Game.unlocked(c.id);
    const t = el(`<button class="thumb ${done ? "done" : ""} ${open ? "" : "locked"}" data-id="${c.id}"
        style="--c:${c.tint};background-image:url('img/loc/${c.id}_card.jpg')" title="${c.name}">
      <span class="thumb-flag">${c.flag}</span>
      ${done ? `<span class="thumb-check">✓</span>` : open ? "" : `<span class="thumb-lock">🔒</span>`}
    </button>`);
    t.onclick = () => { focus = c.id; Game.sfx("pop"); render(); };
    strip.appendChild(t);
  });

  render();
};
