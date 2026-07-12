import * as THREE from 'three';
import { wrapText, darken } from './utils.js';

const CANVAS_W = 1280;
const CANVAS_H = 1280;
const PAD = 60;
const CONTENT_W = CANVAS_W - PAD * 2;

const THEME = {
  fontFamily: 'Avenir, Ubuntu, Arial, Helvetica, sans-serif',
  textColor: '#f4f6f8',
  subtextColor: '#c4c6c8',
  chipBg: 'rgba(255,255,255,0.15)',
  chipText: '#f4f6f8',
  linkBg: 'rgba(255,255,255,0.12)',
  linkHoverBg: 'rgba(255,255,255,0.25)',
  titleSize: 52,
  positionSize: 30,
  datesSize: 24,
  bodySize: 24,
  chipSize: 18,
  linkSize: 36,
  locationSize: 24,
  lineSpacing: 1.35,
  maxTags: 8,
};

function drawRoundedRect(ctx, x, y, w, h, r) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + w - r, y);
  ctx.quadraticCurveTo(x + w, y, x + w, y + r);
  ctx.lineTo(x + w, y + h - r);
  ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
  ctx.lineTo(x + r, y + h);
  ctx.quadraticCurveTo(x, y + h, x, y + h - r);
  ctx.lineTo(x, y + r);
  ctx.quadraticCurveTo(x, y, x + r, y);
  ctx.closePath();
}

function setFont(ctx, size, weight = 'normal') {
  ctx.font = `${weight} ${size}px ${THEME.fontFamily}`;
}

function drawWrappedText(ctx, text, x, y, maxWidth, fontSize, color, maxHeight) {
  setFont(ctx, fontSize);
  ctx.fillStyle = color;
  let lines = wrapText(ctx, text, maxWidth);
  const lh = Math.round(fontSize * THEME.lineSpacing);

  let currentSize = fontSize;
  while (lines.length * lh > maxHeight && currentSize > 14) {
    currentSize -= 2;
    setFont(ctx, currentSize);
    lines = wrapText(ctx, text, maxWidth);
  }

  const maxLines = Math.floor(maxHeight / lh);
  if (lines.length > maxLines) {
    lines = lines.slice(0, maxLines);
    lines[lines.length - 1] = lines[lines.length - 1].replace(/\s*\S*$/, '') + '\u2026';
  }

  for (let i = 0; i < lines.length; i++) {
    ctx.fillText(lines[i], x, y + i * lh);
  }
  return lines.length * lh;
}

function drawTagChips(ctx, tags, x, y, maxWidth) {
  setFont(ctx, THEME.chipSize);
  const chipH = 28;
  const chipPadX = 12;
  const chipGap = 8;
  const rowGap = 6;
  let cx = x;
  let cy = y;
  let drawn = 0;
  const remaining = tags.length - THEME.maxTags;

  for (const tag of tags) {
    if (drawn >= THEME.maxTags) break;
    const tw = ctx.measureText(tag.title).width + chipPadX * 2;
    if (cx + tw > x + maxWidth && cx > x) {
      cx = x;
      cy += chipH + rowGap;
    }
    drawRoundedRect(ctx, cx, cy, tw, chipH, 4);
    ctx.fillStyle = THEME.chipBg;
    ctx.fill();
    ctx.fillStyle = THEME.chipText;
    ctx.fillText(tag.title, cx + chipPadX, cy + 20);
    cx += tw + chipGap;
    drawn++;
  }

  if (remaining > 0) {
    const label = `+${remaining} more`;
    const tw = ctx.measureText(label).width + chipPadX * 2;
    if (cx + tw > x + maxWidth && cx > x) {
      cx = x;
      cy += chipH + rowGap;
    }
    drawRoundedRect(ctx, cx, cy, tw, chipH, 4);
    ctx.fillStyle = 'rgba(255,255,255,0.08)';
    ctx.fill();
    ctx.fillStyle = THEME.subtextColor;
    ctx.fillText(label, cx + chipPadX, cy + 20);
  }
  return (cy - y) + chipH + 12;
}

function fillGradientBg(ctx, bgColor) {
  const grad = ctx.createLinearGradient(0, 0, 0, CANVAS_H);
  grad.addColorStop(0, darken(bgColor, 0.3));
  grad.addColorStop(1, darken(bgColor, 0.6));
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, CANVAS_W, CANVAS_H);
}

function loadImage(src) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error(`Failed to load: ${src}`));
    img.src = src;
  });
}

// ─── Info Poster (left wall) ──────────────────────────────

function drawInfoPoster(canvas, exhibit) {
  const ctx = canvas.getContext('2d');
  const bgColor = exhibit.colors?.background || '#345';
  fillGradientBg(ctx, bgColor);

  ctx.textBaseline = 'top';
  let y = PAD;
  const logoSize = 200;

  if (exhibit.image) {
    y += logoSize + 24;
  }

  // Title
  if (exhibit.titleIsHtml && exhibit.title.toLowerCase().includes('harvix')) {
    setFont(ctx, THEME.titleSize, 'bold');
    const harW = ctx.measureText('Har').width;
    ctx.fillStyle = THEME.textColor;
    ctx.fillText('Har', PAD, y);
    ctx.fillStyle = '#ff0000';
    ctx.fillText('vix', PAD + harW, y);
  } else {
    setFont(ctx, THEME.titleSize, 'bold');
    ctx.fillStyle = THEME.textColor;
    const titleLines = wrapText(ctx, exhibit.title, CONTENT_W);
    const titleLh = Math.round(THEME.titleSize * 1.15);
    for (const line of titleLines) {
      ctx.fillText(line, PAD, y);
      y += titleLh;
    }
    y -= titleLh;
  }
  y += THEME.titleSize + 10;

  if (exhibit.position) {
    setFont(ctx, THEME.positionSize);
    ctx.fillStyle = THEME.textColor;
    const posLines = wrapText(ctx, exhibit.position, CONTENT_W);
    const posLh = Math.round(THEME.positionSize * 1.2);
    for (const line of posLines) {
      ctx.fillText(line, PAD, y);
      y += posLh;
    }
    y += 6;
  }

  if (exhibit.location) {
    setFont(ctx, THEME.locationSize);
    ctx.fillStyle = THEME.subtextColor;
    ctx.fillText(exhibit.location, PAD, y);
    y += THEME.locationSize + 10;
  }

  if (exhibit.dates) {
    setFont(ctx, THEME.datesSize, 'italic');
    ctx.fillStyle = THEME.subtextColor;
    ctx.fillText(exhibit.dates, PAD, y);
    y += THEME.datesSize + 18;
  } else {
    y += 10;
  }

  if (exhibit.description) {
    const maxDescH = exhibit.tags?.length ? 320 : 420;
    const descH = drawWrappedText(ctx, exhibit.description, PAD, y, CONTENT_W, THEME.bodySize, THEME.textColor, maxDescH);
    y += descH + 24;
  }

  if (exhibit.tags?.length) {
    setFont(ctx, THEME.chipSize - 2, 'bold');
    ctx.fillStyle = THEME.subtextColor;
    ctx.fillText('TAGS', PAD, y);
    y += 24;
    drawTagChips(ctx, exhibit.tags, PAD, y, CONTENT_W);
  }
}

export async function createInfoTexture(exhibit) {
  const canvas = document.createElement('canvas');
  canvas.width = CANVAS_W;
  canvas.height = CANVAS_H;
  drawInfoPoster(canvas, exhibit);

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;

  if (exhibit.image) {
    try {
      const img = await loadImage(exhibit.image);
      const ctx = canvas.getContext('2d');
      const logoSize = 200;
      const aspect = img.width / img.height;
      const drawW = aspect >= 1 ? logoSize : logoSize * aspect;
      const drawH = aspect >= 1 ? logoSize / aspect : logoSize;

      ctx.save();
      drawRoundedRect(ctx, PAD, PAD, drawW, drawH, 12);
      ctx.clip();
      ctx.drawImage(img, PAD, PAD, drawW, drawH);
      ctx.restore();
      texture.needsUpdate = true;
    } catch {
      // text-only fallback
    }
  }

  return texture;
}

// ─── Links Poster (right wall) ────────────────────────────

function drawLinksPoster(canvas, exhibit) {
  const ctx = canvas.getContext('2d');
  const bgColor = exhibit.colors?.background || '#345';
  fillGradientBg(ctx, bgColor);

  ctx.textBaseline = 'top';
  const links = exhibit.links || [];
  if (!links.length) return [];

  const linkZones = [];
  const btnH = 80;
  const btnGap = 24;
  const totalH = links.length * btnH + (links.length - 1) * btnGap;
  let y = Math.max(PAD, (CANVAS_H - totalH) / 2);

  setFont(ctx, THEME.chipSize, 'bold');
  ctx.fillStyle = THEME.subtextColor;
  ctx.fillText('LINKS', PAD, PAD);

  for (const link of links) {
    drawRoundedRect(ctx, PAD, y, CONTENT_W, btnH, 10);
    ctx.fillStyle = THEME.linkBg;
    ctx.fill();

    setFont(ctx, THEME.linkSize, 'bold');
    ctx.fillStyle = THEME.textColor;
    const arrow = '\u25B6  ';
    ctx.fillText(arrow + link.label, PAD + 28, y + (btnH - THEME.linkSize) / 2);

    // UV coordinates (0=top, 1=bottom for canvas; Three.js UV 0=bottom, 1=top)
    const uvY1 = 1 - (y + btnH) / CANVAS_H;
    const uvY2 = 1 - y / CANVAS_H;
    linkZones.push({ label: link.label, url: link.url, uvY1, uvY2 });

    y += btnH + btnGap;
  }

  return linkZones;
}

export function createLinksTexture(exhibit) {
  const canvas = document.createElement('canvas');
  canvas.width = CANVAS_W;
  canvas.height = CANVAS_H;
  const linkZones = drawLinksPoster(canvas, exhibit);

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;

  return { texture, linkZones };
}
