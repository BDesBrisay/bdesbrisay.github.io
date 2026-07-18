import { clamp } from './utils.js';
import { getNearestEgg } from './easterEggs.js';

let overlayEl = null;
let smoothWeight = 0;
let currentExhibitId = null;
let exhibitMap = new Map();
let hoveredLink = null;

function escapeHtml(str) {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function renderTags(tags) {
  if (!tags?.length) return '';
  const shown = tags.slice(0, 8);
  const chips = shown.map(t => `<span class="overlay-tag">${escapeHtml(t.title)}</span>`).join('');
  const more = tags.length > 8 ? `<span class="overlay-tag muted">+${tags.length - 8} more</span>` : '';
  return `<div class="overlay-tags">${chips}${more}</div>`;
}

function renderLinks(links) {
  if (!links?.length) return '';
  return `<div class="overlay-links">${links.map(l =>
    `<button type="button" class="overlay-link" data-url="${escapeHtml(l.url)}">${escapeHtml(l.label)}</button>`
  ).join('')}</div>`;
}

function renderCard(exhibit) {
  const img = exhibit.image
    ? `<img class="overlay-img" src="${escapeHtml(exhibit.image)}" alt="" />`
    : '';
  const position = exhibit.position ? `<p class="overlay-position">${escapeHtml(exhibit.position)}</p>` : '';
  const location = exhibit.location ? `<p class="overlay-location">${escapeHtml(exhibit.location)}</p>` : '';
  const dates = exhibit.dates ? `<p class="overlay-dates">${escapeHtml(exhibit.dates)}</p>` : '';
  const desc = exhibit.description ? `<p class="overlay-desc">${escapeHtml(exhibit.description)}</p>` : '';

  return `
    <div class="overlay-inner">
      ${img}
      <div class="overlay-body">
        <h2 class="overlay-title">${escapeHtml(exhibit.title)}</h2>
        ${position}
        ${location}
        ${dates}
        ${desc}
        ${renderTags(exhibit.tags)}
        ${renderLinks(exhibit.links)}
      </div>
    </div>
  `;
}

export function initOverlay(exhibits) {
  overlayEl = document.getElementById('drive-overlay');
  exhibitMap = new Map(exhibits.map(e => [e.id, e]));

  overlayEl?.addEventListener('click', (e) => {
    const btn = e.target.closest('.overlay-link');
    if (!btn) return;
    const url = btn.dataset.url;
    if (url) window.open(url, '_blank');
  });

  overlayEl?.addEventListener('mouseover', (e) => {
    const btn = e.target.closest('.overlay-link');
    hoveredLink = btn ? { label: btn.textContent, url: btn.dataset.url } : null;
    updateCrosshair();
  });

  overlayEl?.addEventListener('mouseout', () => {
    hoveredLink = null;
    updateCrosshair();
  });

  return overlayEl;
}

function updateCrosshair() {
  const crosshairEl = document.getElementById('crosshair');
  if (crosshairEl) crosshairEl.classList.toggle('active', !!hoveredLink);
}

export function updateOverlay(driveState, exhibits) {
  if (!overlayEl) return;

  const targetWeight = driveState.proximityWeight || 0;
  smoothWeight += (targetWeight - smoothWeight) * 0.12;
  smoothWeight = clamp(smoothWeight, 0, 1);

  overlayEl.style.opacity = String(smoothWeight);
  overlayEl.style.pointerEvents = smoothWeight > 0.25 ? 'auto' : 'none';

  const stop = driveState.nearestStop;
  if (!stop || smoothWeight < 0.05) {
    if (smoothWeight < 0.02) currentExhibitId = null;
    return;
  }

  if (stop.exhibitId !== currentExhibitId) {
    currentExhibitId = stop.exhibitId;
    const exhibit = exhibitMap.get(stop.exhibitId);
    if (exhibit) {
      overlayEl.innerHTML = renderCard(exhibit);
      overlayEl.style.setProperty('--accent', exhibit.colors.primary);
    }
  }
}

export function getHoveredLink() {
  return hoveredLink;
}

export function updateEasterEggToast(driveState, eggs, config) {
  const toast = document.getElementById('egg-toast');
  if (!toast) return;

  const hit = getNearestEgg(driveState.position, eggs, config);
  if (hit) {
    const { egg } = hit;
    toast.classList.add('visible');
    toast.innerHTML = `
      <strong>${escapeHtml(egg.title)}</strong>
      <p>${escapeHtml(egg.body)}</p>
      ${egg.url ? `<button type="button" class="egg-link" data-url="${escapeHtml(egg.url)}">Open</button>` : ''}
    `;
    toast.style.opacity = String(clamp(1 - hit.distance / 4, 0.3, 1));

    const btn = toast.querySelector('.egg-link');
    if (btn && !btn._bound) {
      btn._bound = true;
      btn.addEventListener('click', () => window.open(btn.dataset.url, '_blank'));
    }
  } else {
    toast.classList.remove('visible');
    toast.style.opacity = '0';
  }
}
