/* Era 4 — the Waterfall Archives. Rebuild the broken river sequence. */
Game.games.debugjs = (stage, c) => {

  const LINES = [
    { id: "declare", src: `  const route = [];`,                        op: st => { st.declared = true; } },
    { id: "push1",   src: `  route.push("Horizon");`,                  op: st => st.push("Horizon") },
    { id: "push2",   src: `  route.push(\`\${name}\`);`,                op: st => st.push(CONFIG.name) },
    { id: "log",     src: `  console.log(route.join(" → ") + " ✦");`,  op: st => st.log() }
  ];
  const SOLUTION = ["declare", "push1", "push2", "log"];

  const run = order => {
    const st = {
      declared: false, arr: [], out: null, err: null,
      push(v) {
        if (!this.declared) { this.err = "ReferenceError: Cannot access 'route' before initialization"; return; }
        this.arr.push(v);
      },
      log() {
        if (this.err) return;
        if (!this.declared) { this.err = "ReferenceError: route is not defined"; return; }
        if (this.out === null) this.out = this.arr.join(" → ") + " ✦";
      }
    };
    for (const id of order) { LINES.find(l => l.id === id).op(st); if (st.err) break; }
    return st;
  };
  const EXPECTED = run(SOLUTION).out;

  let order = shuffle(SOLUTION.slice());
  while (order.join() === SOLUTION.join()) order = shuffle(order);

  const card = el(`<section class="glass enter">
    <div class="head">
        <div class="glyph" style="--c:#8FB07A">✺</div>
      <div class="t">
        <div class="kicker" style="--c:${(c&&c.tint)||'#7FA8C4'}">${c?c.flag+' '+c.name:''} · River runes</div>
        <h2>The current compiler</h2>
        <p>Four river-runes are out of order. Swap two at a time until the current flows.</p>
      </div>
    </div>
    <div class="code">
      <div class="dim">function restoreCurrent(name) {</div>
      <div id="lines"></div>
      <div class="dim">}</div>
      <div class="dim">restoreCurrent(<span class="str">"${CONFIG.name}"</span>);</div>
    </div>
    <div class="out" id="out">&gt; _</div>
    <p class="muted" id="hint" style="margin-top:10px;min-height:20px"></p>
  </section>`);
  stage.appendChild(card);

  const box = card.querySelector("#lines"), out = card.querySelector("#out"), hint = card.querySelector("#hint");
  let sel = null, swaps = 0, solved = false;

  const render = () => {
    box.innerHTML = "";
    order.forEach((id, i) => {
      const line = LINES.find(l => l.id === id);
      const node = el(`<div class="line" role="button" tabindex="0"><span class="num">${i + 2}</span><span>${esc(line.src)}</span></div>`);
      if (sel === i) node.classList.add("sel");
      node.onclick = () => pick(i);
      node.onkeydown = e => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); pick(i); } };
      box.appendChild(node);
    });
    execute();
  };

  const pick = i => {
    if (solved) return;
    if (sel === null) { sel = i; Game.sfx("pop"); return render(); }
    if (sel === i)    { sel = null; return render(); }
    [order[sel], order[i]] = [order[i], order[sel]];
    sel = null; swaps++; Game.sfx("pop");
    render();
  };

  const execute = () => {
    const st = run(order);
    if (st.err) {
      out.style.color = "#FF7B6B";
      out.textContent = "✗ " + st.err;
    } else if (st.out === EXPECTED) {
      out.style.color = "#7CFF9E";
      out.textContent = "> " + st.out;
      if (!solved) { solved = true; setTimeout(() => Game.win(), 950); }
    } else {
      out.style.color = "#FFD86B";
      out.textContent = "> " + (st.out === null ? "(nothing printed)" : st.out);
    }
    if (swaps >= 4 && !solved) hint.textContent = "psst — you can't push into an array before you declare it 👀";
  };

  render();
};

function esc(s) { return s.replace(/[&<>]/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;" }[c])); }
