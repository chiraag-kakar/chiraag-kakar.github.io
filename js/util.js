// Small shared helpers.

export function hexToRgb(hex) {
  const h = hex.replace('#', '');
  return [parseInt(h.slice(0, 2), 16), parseInt(h.slice(2, 4), 16), parseInt(h.slice(4, 6), 16)];
}

export function esc(s) {
  return String(s == null ? '' : s)
    .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

// Animate a numeric value up to its final form (preserving prefix/suffix).
export function animateCount(el) {
  if (el.__counted) return;
  el.__counted = true;
  const raw = el.getAttribute('data-d-count') || el.getAttribute('data-cd-count') || el.textContent;
  const m = raw.match(/^([^A-Za-z]*?)(\d[\d,]*(?:\.\d+)?)(.*)$/);
  if (!m) { el.textContent = raw; return; }
  const pre = m[1], numStr = m[2], post = m[3];
  const target = parseFloat(numStr.replace(/,/g, ''));
  const dec = (numStr.split('.')[1] || '').length;
  const dur = 1000, t0 = performance.now();
  const step = (t) => {
    const p = Math.min(1, (t - t0) / dur);
    const eased = 1 - Math.pow(1 - p, 3);
    const v = target * eased;
    el.textContent = pre + (dec ? v.toFixed(dec) : Math.round(v).toLocaleString()) + post;
    if (p < 1) requestAnimationFrame(step);
  };
  requestAnimationFrame(step);
}
