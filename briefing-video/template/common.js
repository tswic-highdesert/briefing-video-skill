// Shared by every scene. build.py pastes this in place of //COMMON_JS inside each scene IIFE,
// after `const START = <scene data-start>;`. Every helper takes ABSOLUTE voice-track seconds
// and converts with T(), so cue times can be copied straight from vo/words.txt.
const tl = gsap.timeline({ paused: true });
const T = t => Math.max(0, t - START);
const fmtInt = n => Math.round(n).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
function count(sel, from, to, at, dur, fmt) {
  const el = document.querySelector(sel); const o = { v: from };
  tl.fromTo(o, { v: from }, { v: to, duration: dur, ease: "power2.out", onUpdate: () => { el.textContent = fmt(o.v); } }, T(at));
}
function words(sel, at, stagger) {
  tl.fromTo(sel + " .w", { opacity: 0, filter: "blur(8px)" }, { opacity: 1, filter: "blur(0px)", duration: 0.28, stagger: stagger || 0.07, ease: "power2.out" }, T(at));
}
function rise(sel, at, opts) {
  const o = opts || {};
  tl.fromTo(sel, { opacity: 0, y: o.y ?? 36, scale: o.s ?? 1 }, { opacity: 1, y: 0, scale: 1, duration: o.d ?? 0.7, ease: o.ease || "expo.out", stagger: o.stagger || 0 }, T(at));
}
function pop(sel, at, rot) {
  tl.fromTo(sel, { opacity: 0, scale: 0.6, rotation: rot || 0 }, { opacity: 1, scale: 1, rotation: rot || 0, duration: 0.55, ease: "back.out(1.7)" }, T(at));
}
function draw(sel, at, dur) {
  tl.fromTo(sel, { strokeDashoffset: 1, opacity: 1 }, { strokeDashoffset: 0, duration: dur || 0.45, ease: "power2.inOut" }, T(at));
}
function reveal(sel, at, dur) {
  tl.fromTo(sel, { clipPath: "inset(-20% 100% -20% -2%)" }, { clipPath: "inset(-20% -2% -20% -2%)", duration: dur || 0.6, ease: "power2.inOut" }, T(at));
}
function flood(sel, dur) { tl.fromTo(sel, { opacity: 1 }, { opacity: 0, duration: dur || 0.55, ease: "power2.inOut" }, 0.02); }
function exitAll(sel, at) { tl.to(sel, { opacity: 0, filter: "blur(10px)", duration: 0.3, ease: "power2.in" }, T(at)); }

function drift(sel, dur) { tl.fromTo(sel, { scale: 1 }, { scale: 1.03, duration: dur, ease: "none" }, 0); }
