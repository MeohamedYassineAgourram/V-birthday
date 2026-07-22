/* Canvas painters for the Chocobi minigame. */
const DRAW = {
  chocobi(ctx, x, y, r, rot) {
    ctx.save();
    ctx.translate(x, y); ctx.rotate(rot);
    ctx.shadowColor = "rgba(17,18,20,.28)"; ctx.shadowBlur = 10; ctx.shadowOffsetY = 4;
    ctx.lineWidth = 3; ctx.strokeStyle = "#2B2118"; ctx.fillStyle = "#E9AE55";
    ctx.beginPath();
    for (let i = 0; i < 10; i++) {
      const a = (Math.PI / 5) * i - Math.PI / 2, rr = i % 2 ? r * .5 : r;
      i ? ctx.lineTo(Math.cos(a) * rr, Math.sin(a) * rr)
        : ctx.moveTo(Math.cos(a) * rr, Math.sin(a) * rr);
    }
    ctx.closePath(); ctx.fill(); ctx.stroke();
    ctx.shadowColor = "transparent";
    ctx.fillStyle = "#5B3418";
    [[-r * .25, -r * .1], [r * .22, r * .05], [0, r * .32]].forEach(([dx, dy]) => {
      ctx.beginPath(); ctx.arc(dx, dy, r * .11, 0, 7); ctx.fill();
    });
    ctx.restore();
  },

  pepper(ctx, x, y, r, rot) {
    ctx.save();
    ctx.translate(x, y); ctx.rotate(rot);
    ctx.shadowColor = "rgba(17,18,20,.28)"; ctx.shadowBlur = 10; ctx.shadowOffsetY = 4;
    ctx.lineWidth = 3; ctx.strokeStyle = "#23401F"; ctx.fillStyle = "#4FA85B";
    ctx.beginPath(); ctx.ellipse(0, 2, r * .78, r, 0, 0, 7); ctx.fill(); ctx.stroke();
    ctx.shadowColor = "transparent";
    ctx.fillStyle = "#2F7A3C";
    ctx.beginPath(); ctx.roundRect(-r * .18, -r * 1.25, r * .36, r * .5, 3); ctx.fill(); ctx.stroke();
    ctx.restore();
  },

  /* Shin-chan's snack basket */
  basket(ctx, x, y, w, h) {
    ctx.save();
    ctx.shadowColor = "rgba(17,18,20,.3)"; ctx.shadowBlur = 14; ctx.shadowOffsetY = 6;
    ctx.lineWidth = 4; ctx.strokeStyle = "#2B2118";
    const g = ctx.createLinearGradient(0, y, 0, y + h);
    g.addColorStop(0, "#FF6B4A"); g.addColorStop(1, "#D4321F");
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.moveTo(x - w / 2, y); ctx.lineTo(x + w / 2, y);
    ctx.lineTo(x + w / 2 - 9, y + h); ctx.lineTo(x - w / 2 + 9, y + h);
    ctx.closePath(); ctx.fill(); ctx.stroke();
    ctx.shadowColor = "transparent";
    ctx.strokeStyle = "rgba(255,255,255,.45)"; ctx.lineWidth = 3;
    for (let i = 1; i < 4; i++) {
      const px = x - w / 2 + (w / 4) * i;
      ctx.beginPath(); ctx.moveTo(px, y + 3); ctx.lineTo(px - 5, y + h - 3); ctx.stroke();
    }
    ctx.restore();
  }
};
