/* Editorial Earth landing — the five missions are presented as interactive case studies. */
Game.scenes.globe = (stage) => {
  const positions = [[54, 31], [66, 23], [48, 45], [70, 53], [58, 66]];
  let selected = 0;

  const markerMarkup = COUNTRIES.map((country, index) => {
    const [x, y] = positions[index];
    return `<button class="earth-hotspot ${index === 0 ? "is-active" : ""}" data-index="${index}" style="--x:${x}%;--y:${y}%" aria-label="View ${country.name} mission">
      <i></i><span>${country.flag} ${country.name}</span>
    </button>`;
  }).join("");

  const view = el(`<section class="foundation-landing enter">
    <main class="foundation-stage">
      <h1 class="sr-only">Viviane's journey around the world</h1>
      <aside class="foundation-rail"><i></i> FEATURED MISSION</aside>
      <div class="space-grain" aria-hidden="true"></div>
      <div class="earth-halo" aria-hidden="true"></div>
      <div class="foundation-globe" id="globeStage"><div class="globe-load" id="gload"><span class="spin"></span></div></div>
      <div class="earth-hotspots">${markerMarkup}</div>

      <article class="feature-card" id="featureCard">
        <img id="featureImage" src="img/loc/japan_card.jpg" alt="Japan, mission location">
        <div class="feature-copy"><span id="featureCode">MISSION 01</span><h2 id="featureTitle">Japan</h2><p id="featureText">Petal Archive · Kawaguchiko</p><button id="accept">Accept the challenge <b>→</b></button></div>
      </article>

      <aside class="foundation-social"><i>✦</i><p>Five countries. Five missions. One reason waiting at the end.</p></aside>
    </main>
  </section>`);
  stage.appendChild(view);

  const host = view.querySelector("#globeStage");
  const gload = view.querySelector("#gload");
  const image = view.querySelector("#featureImage");
  const code = view.querySelector("#featureCode");
  const title = view.querySelector("#featureTitle");
  const text = view.querySelector("#featureText");
  const card = view.querySelector("#featureCard");
  const hotspotEls = [...view.querySelectorAll(".earth-hotspot")];
  const stageEl = view.querySelector(".foundation-stage");

  Game._3d = typeof Globe3D !== "undefined"
    ? Globe3D.mount(host, { onReady: () => { gload.classList.add("gone"); Game._3d && Game._3d.focus(0); },
                            onError: () => { gload.classList.add("gone"); host.classList.add("noglobe"); } })
    : null;
  if (!Game._3d) { gload.classList.add("gone"); host.classList.add("noglobe"); }

  const select = index => {
    selected = index % COUNTRIES.length;
    const country = COUNTRIES[selected];
    hotspotEls.forEach((node, i) => node.classList.toggle("is-active", i === selected));
    card.classList.add("changing");
    setTimeout(() => {
      image.src = `img/loc/${country.id}_card.jpg`;
      image.alt = `${country.name}, mission location`;
      code.textContent = country.code;
      title.textContent = country.name;
      text.textContent = `${country.brief.split(".")[0]} · ${country.city}`;
      card.classList.remove("changing");
    }, 130);
    if (Game._3d && Game._3d.focus) Game._3d.focus(selected);
  };
  hotspotEls.forEach(node => node.onclick = () => select(Number(node.dataset.index)));

  stageEl.addEventListener("pointermove", event => {
    const rect = stageEl.getBoundingClientRect();
    const x = (event.clientX - rect.left) / rect.width - .5;
    const y = (event.clientY - rect.top) / rect.height - .5;
    card.style.setProperty("--card-x", `${x * 7}px`);
    card.style.setProperty("--card-y", `${y * 5}px`);
  });
  stageEl.addEventListener("pointerleave", () => {
    card.style.setProperty("--card-x", "0px");
    card.style.setProperty("--card-y", "0px");
  });

  view.querySelector("#accept").onclick = () => {
    Game.audio(); Game.sfx("good");
    if (Game._3d && Game._3d.zoomIn) Game._3d.zoomIn();
    setTimeout(() => Game.travel("journey"), 620);
  };
};
