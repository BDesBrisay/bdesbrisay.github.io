export function resolveImagePath(src) {
  if (src.startsWith('./images/')) return '../images/' + src.slice('./images/'.length);
  if (src.startsWith('images/')) return '../images/' + src.slice('images/'.length);
  return src;
}

export function wrapText(ctx, text, maxWidth) {
  const words = text.split(' ');
  const lines = [];
  let current = '';

  for (const word of words) {
    const test = current ? current + ' ' + word : word;
    if (ctx.measureText(test).width > maxWidth && current) {
      lines.push(current);
      current = word;
    } else {
      current = test;
    }
  }
  if (current) lines.push(current);
  return lines;
}

export function isMobileUI() {
  return window.matchMedia('(pointer: coarse)').matches
      && window.matchMedia('(max-width: 900px)').matches;
}

export function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

export function hexToRgb(hex) {
  const n = parseInt(hex.replace('#', ''), 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}

export function darken(hex, amount) {
  const [r, g, b] = hexToRgb(hex);
  const f = 1 - amount;
  const to2 = v => Math.round(v * f).toString(16).padStart(2, '0');
  return '#' + to2(r) + to2(g) + to2(b);
}
