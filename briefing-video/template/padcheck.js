// Card padding lint. build.py appends this to common.js only with `--padcheck`; never ship it in a render.
// On every timeline update it measures each visible .card against the union of its visible content
// (text glyph boxes, filled or bordered leaf boxes, SVG shapes) and marks a card that breaks a rule
// with a magenta outline and a label like "PAD t38 r40 b10 l40 >=31". Snapshot settled moments and look.
// A "card" is any .card, any [data-pad-card], and any other box that looks like one: a filled
// background, a corner radius of 16 px or more, at least 160x100, with text inside (not .pill).
// Rules (in card px, drift scale removed):
//   need = clamp(11% of the card's short side, 24, 36)
//   - any side tighter than need, or content outside the card ("t-6")
//   - top and bottom unbalanced: the larger is more than 1.8x the smaller and 32 px more ("t38 b92 uneven")
// Skip an element (badge that overhangs on purpose, the label itself) with data-pad-ignore;
// skip a whole card (clock face, phone, full-bleed chart) with data-pad-ignore on the card.
function padcheck() { try { padcheckRun(); } catch (e) { padcheckMark(document.querySelector("#root div"), "PADCHECK ERROR " + e.message); } }
function padcheckMark(card, text) {
  card.setAttribute("data-pad-flag", "");
  card.style.outline = "6px solid #FF00FF";
  const lab = document.createElement("div");
  lab.setAttribute("data-pad-label", ""); lab.setAttribute("data-pad-ignore", "");
  lab.style.cssText = "position:absolute;left:0;top:0;z-index:99;background:#FF00FF;color:#fff;font:700 22px/1.2 monospace;padding:4px 8px;white-space:nowrap;transform:translateY(-100%)";
  lab.textContent = text;
  card.appendChild(lab);
}
function padcheckRun() {
  document.querySelectorAll("[data-pad-label]").forEach(n => n.remove());
  document.querySelectorAll("[data-pad-flag]").forEach(n => { n.style.outline = ""; n.removeAttribute("data-pad-flag"); });
  // Visible inside its own scene. The runtime may still hide the scene host when this runs, so stop at the scene root.
  const shown = el => {
    for (let n = el; n && n.nodeType === 1; n = n.parentElement) {
      const cs = getComputedStyle(n);
      if (cs.display === "none" || parseFloat(cs.opacity) < 0.02) return false;
      if (n.id === "root" && n.dataset.compositionId) return true;
    }
    return true;
  };
  const filled = cs => (cs.backgroundColor !== "rgba(0, 0, 0, 0)" && cs.backgroundColor !== "transparent") || cs.backgroundImage !== "none" || parseFloat(cs.borderTopWidth) > 0;
  const looksLikeCard = el => {
    if (el.classList.contains("pill") || !el.textContent.trim()) return false;
    const cs = getComputedStyle(el);
    return filled(cs) && parseFloat(cs.borderTopLeftRadius) >= 16 && el.offsetWidth >= 160 && el.offsetHeight >= 100;
  };
  const cards = [...document.querySelectorAll("#root div, #root .card, #root [data-pad-card]")].filter(el => el.matches(".card,[data-pad-card]") || (el.tagName === "DIV" && looksLikeCard(el)));
  for (const card of cards) {
    if (card.hasAttribute("data-pad-ignore") || !shown(card)) continue;
    const R = card.getBoundingClientRect();
    if (R.width < 40 || R.height < 40) continue;
    const s = R.width / card.offsetWidth || 1;
    const boxes = [];
    // One box per line. A font's content area runs past its glyphs (more so for fallback glyphs like ✓),
    // so trim each line to about 1.15 em, centred.
    const textBoxes = (n, cs) => {
      const r = document.createRange(); r.selectNodeContents(n);
      const em = parseFloat(cs.fontSize) * s;
      for (const b of r.getClientRects()) {
        const cut = Math.max(0, (b.height - 1.15 * em) / 2);
        boxes.push({ left: b.left, right: b.right, top: b.top + cut, bottom: b.bottom - cut, width: b.width, height: b.height - 2 * cut });
      }
    };
    const walk = el => {
      for (const c of el.children) {
        if (c.hasAttribute("data-pad-ignore") || !shown(c)) continue;
        if (cards.includes(c)) { boxes.push(c.getBoundingClientRect()); continue; }
        if (c instanceof SVGElement) {
          const shapes = c.tagName.toLowerCase() === "svg" ? c.querySelectorAll("path,line,circle,rect,ellipse,polyline,polygon,text") : [c];
          for (const p of shapes) { const b = p.getBoundingClientRect(); if (b.width + b.height > 0) boxes.push(b); }
          if (!shapes.length) boxes.push(c.getBoundingClientRect());
          continue;
        }
        const cs = getComputedStyle(c);
        for (const n of c.childNodes) if (n.nodeType === 3 && n.textContent.trim()) textBoxes(n, cs);
        const b = c.getBoundingClientRect();
        if (filled(cs) && !c.children.length && b.width * b.height >= 0.9 * R.width * R.height) continue; // background layer (glow, lit fill)
        if (filled(cs) || /^(IMG|VIDEO|CANVAS)$/.test(c.tagName)) boxes.push(b);
        if (!/^(IMG|VIDEO|CANVAS)$/.test(c.tagName)) walk(c);
      }
    };
    for (const n of card.childNodes) if (n.nodeType === 3 && n.textContent.trim()) textBoxes(n, getComputedStyle(card));
    walk(card);
    const real = boxes.filter(b => b.width > 0 && b.height > 0);
    if (!real.length) continue;
    const C = { l: Math.min(...real.map(b => b.left)), t: Math.min(...real.map(b => b.top)), r: Math.max(...real.map(b => b.right)), b: Math.max(...real.map(b => b.bottom)) };
    const ins = { t: (C.t - R.top) / s, r: (R.right - C.r) / s, b: (R.bottom - C.b) / s, l: (C.l - R.left) / s };
    const need = Math.max(24, Math.min(36, Math.round(0.11 * Math.min(card.offsetWidth, card.offsetHeight))));
    const tight = Object.entries(ins).filter(([, v]) => v < need - 1).map(([k]) => k);
    const lo = Math.min(ins.t, ins.b), hi = Math.max(ins.t, ins.b);
    const uneven = hi > 1.8 * lo && hi - lo > 32;
    if (!tight.length && !uneven) continue;
    padcheckMark(card, "PAD " + ["t", "r", "b", "l"].map(k => k + Math.round(ins[k])).join(" ") + " >=" + need + (tight.length ? " tight:" + tight.join("") : "") + (uneven ? " uneven" : ""));
  }
}
tl.eventCallback("onUpdate", padcheck);
