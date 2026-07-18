import * as THREE from 'three';
import { getSurfaceFrame } from './planet.js';

let compassEl = null;
let minimapCanvas = null;
let minimapCtx = null;
let roadPoints2D = [];

export function initNavigation(config, stops, tourPathPoints) {
  compassEl = document.getElementById('nav-compass');
  minimapCanvas = document.getElementById('nav-minimap');
  if (minimapCanvas) {
    minimapCtx = minimapCanvas.getContext('2d');
    minimapCanvas.width = config.nav.minimapSize;
    minimapCanvas.height = config.nav.minimapSize;
  }

  roadPoints2D = tourPathPoints.map(p => {
    const lat = Math.asin(p.y / p.length());
    const lon = Math.atan2(p.z, p.x);
    return { lat, lon };
  });
}

export function updateNavigation(driveState, stops, config) {
  const hidden = driveState.tourComplete;

  if (compassEl) {
    compassEl.classList.toggle('hidden', hidden || !driveState.nextStop);
    if (!hidden && driveState.nextStop) {
      const to = new THREE.Vector3(
        driveState.nextStop.position.x,
        driveState.nextStop.position.y,
        driveState.nextStop.position.z,
      );
      const from = new THREE.Vector3(
        driveState.position.x,
        driveState.position.y,
        driveState.position.z,
      );
      const frame = getSurfaceFrame(from, config);
      const dir = to.clone().sub(from).projectOnPlane(frame.normal).normalize();
      const angle = Math.atan2(dir.dot(frame.east), dir.dot(frame.north));
      const arrow = compassEl.querySelector('.compass-arrow');
      if (arrow) arrow.style.transform = `rotate(${angle}rad)`;
    }
  }

  if (minimapCanvas && minimapCtx) {
    minimapCanvas.classList.toggle('hidden', hidden);
    if (!hidden) drawMinimap(driveState, stops, config);
  }
}

function drawMinimap(driveState, stops, config) {
  const size = config.nav.minimapSize;
  const zoom = config.nav.minimapZoom;
  const ctx = minimapCtx;
  const cx = size / 2;
  const cy = size / 2;

  ctx.clearRect(0, 0, size, size);

  ctx.fillStyle = 'rgba(10, 10, 20, 0.75)';
  ctx.beginPath();
  ctx.arc(cx, cy, size / 2 - 2, 0, Math.PI * 2);
  ctx.fill();

  ctx.strokeStyle = 'rgba(255,255,255,0.15)';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.arc(cx, cy, size / 2 - 4, 0, Math.PI * 2);
  ctx.stroke();

  function toXY(lat, lon) {
    return {
      x: cx + lon * size * zoom,
      y: cy - lat * size * zoom,
    };
  }

  if (roadPoints2D.length > 1) {
    ctx.strokeStyle = 'rgba(184, 180, 164, 0.85)';
    ctx.lineWidth = 3;
    ctx.beginPath();
    const first = toXY(roadPoints2D[0].lat, roadPoints2D[0].lon);
    ctx.moveTo(first.x, first.y);
    for (let i = 1; i < roadPoints2D.length; i++) {
      const p = toXY(roadPoints2D[i].lat, roadPoints2D[i].lon);
      ctx.lineTo(p.x, p.y);
    }
    ctx.stroke();
  }

  for (const stop of stops) {
    const p = toXY(stop.lat, stop.lon);
    const isNext = driveState.nextStop && driveState.nextStop.index === stop.index;
    ctx.fillStyle = isNext ? stop.colors.primary : 'rgba(255,255,255,0.4)';
    ctx.beginPath();
    ctx.arc(p.x, p.y, isNext ? 4 : 2.5, 0, Math.PI * 2);
    ctx.fill();
  }

  const car = toXY(driveState.lat, driveState.lon);
  ctx.fillStyle = '#e74c3c';
  ctx.beginPath();
  ctx.arc(car.x, car.y, 4, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = '#fff';
  ctx.lineWidth = 1.5;
  ctx.stroke();
}
