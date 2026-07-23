/* The journey board — an immersive, floating deck of destination cards.
   The active location sits in front while the rest of the route is layered
   behind it, so the board feels like a physical set of travel cards. */
Game.scenes.journey = (stage) => {
  let focus = (Game.nextCountry() || COUNTRIES[COUNTRIES.length - 1]).id;

  const view = el(`<section class="journey journey-deck enter">
    <header class="journey-head">
      <div class="eyebrow"><span class="dot-live"></span> Route selection · ${Game.lit} of ${COUNTRIES.length} cleared</div>
      <h1 class="journey-title">Choose your next destination</h1>
      <p>Each stop unlocks a new part of the journey.</p>
    </header>

    <div class="destination-deck" id="destinationDeck" aria-label="Journey destinations"></div>
    <p class="deck-hint">Select an available destination to bring it forward.</p>
  </section>`);
  stage.appendChild(view);

  const deck = view.querySelector("#destinationDeck");
  const cards = new Map();

  const cardMarkup = (c, index) => {
    const open = Game.unlocked(c.id);
    const done = Game.done.has(c.id);
    const action = done ? "Replay mission" : c.finale ? "Arrive in Paris" : "Begin mission";
    const state = done ? "cleared" : open ? "available" : "locked";

    return `<article class="destination-card ${state}" data-id="${c.id}" data-slot="0"
      data-index="${index}" style="--c:${c.tint}" role="button" aria-label="${c.name}${open ? "" : ", locked"}" tabindex="${open ? "0" : "-1"}">
      <div class="destination-image" style="background-image:url('img/loc/${c.id}_card.jpg')"></div>
      <div class="destination-shade"></div>
      <div class="destination-topline">
        <span class="destination-step">${String(index + 1).padStart(2, "0")} / ${COUNTRIES.length}</span>
        <span class="destination-state">${done ? "Cleared" : open ? "Available" : "Locked"}</span>
      </div>
      <div class="destination-caption">
        <span class="destination-flag">${c.flag}</span>
        <span>${c.name}</span>
      </div>
      <div class="destination-copy">
        <p class="destination-code">${c.code}</p>
        <h2>${c.name}</h2>
        <p class="destination-city">${c.flag} ${c.city}</p>
        <p class="destination-brief">${c.brief}</p>
        <button class="destination-action" type="button">${action} <span>→</span></button>
      </div>
      <div class="destination-lock" aria-hidden="true"><span>✦</span><p>Complete the earlier stop first</p></div>
    </article>`;
  };

  COUNTRIES.forEach((c, index) => {
    const card = el(cardMarkup(c, index));
    cards.set(c.id, card);
    deck.appendChild(card);

    card.addEventListener("click", event => {
      const isAction = event.target.closest(".destination-action");
      if (isAction && c.id === focus && Game.unlocked(c.id)) {
        event.stopPropagation();
        Game.audio();
        Game.sfx("good");
        Game.travel(c.id);
        return;
      }

      if (!Game.unlocked(c.id)) {
        Game.sfx("bad");
        Game.toast("Complete the earlier stop to unlock ${c.name}.");
        return;
      }

      if (focus !== c.id) {
        focus = c.id;
        Game.sfx("pop");
        updateDeck();
      }
    });

    card.addEventListener("keydown", event => {
      if (event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        card.click();
      }
    });
  });

  const updateDeck = () => {
    const focusIndex = COUNTRIES.findIndex(c => c.id === focus);

    COUNTRIES.forEach((c, index) => {
      const card = cards.get(c.id);
      let slot = index - focusIndex;

      // Keep all five cards in the same compact orbit around the active card.
      if (slot > 2) slot -= COUNTRIES.length;
      if (slot < -2) slot += COUNTRIES.length;

      const active = slot === 0;
      card.dataset.slot = String(slot);
      card.classList.toggle("is-active", active);
      card.setAttribute("aria-current", active ? "true" : "false");
      card.style.zIndex = String(active ? 10 : 6 - Math.abs(slot));
    });
  };

  updateDeck();
};
