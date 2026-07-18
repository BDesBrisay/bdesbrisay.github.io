import { GALLERY_CONFIG, PROFILE_EXHIBIT } from './config.js';
import { buildExhibits } from './exhibits.js';
import { buildSphereStops, sampleTourPathPoints } from './planet.js';
import { buildEasterEggList } from './easterEggs.js';
import { initScene } from './scene.js';
import { createInputManager } from './controls.js';
import { initOverlay, updateOverlay, updateEasterEggToast, getHoveredLink } from './overlay.js';
import { initNavigation, updateNavigation } from './navigation.js';
import { runIntro } from './intro.js';
import { isMobileUI } from './utils.js';

if (typeof PROJECTS === 'undefined' || !PROJECTS.length) {
  throw new Error('PROJECTS.js not loaded — make sure ../PROJECTS.js is included before this module.');
}

const config = GALLERY_CONFIG;
const mobile = isMobileUI();

await runIntro(config);

const exhibits = buildExhibits(PROJECTS, PROFILE_EXHIBIT, config);
const stops = buildSphereStops(exhibits, config);
const eggs = buildEasterEggList();
const tourPathPoints = sampleTourPathPoints(stops, config, 12);

console.log(`Planet Bryce: ${stops.length} zones`);

const container = document.getElementById('canvas-container');

let getDriveState = () => ({
  position: stops[0].position,
  lat: stops[0].lat,
  lon: stops[0].lon,
  proximityWeight: 1,
  nearestStop: stops[0],
  tourIndex: 1,
  tourComplete: false,
  nextStop: stops[1] ?? null,
  visited: new Set([0]),
});

const { camera, renderer, car, update: updateScene } = await initScene(
  container, exhibits, stops, eggs, config, getDriveState,
);

initOverlay(exhibits);
initNavigation(config, stops, tourPathPoints);

const input = createInputManager({
  domElement: container,
  camera,
  renderer,
  config,
  isMobile: mobile,
  car,
  stops,
  getHoveredLink,
});

getDriveState = input.getDriveState;

let prev = performance.now();

function loop(now) {
  const dt = Math.min((now - prev) / 1000, 0.1);
  prev = now;
  input.update(dt);
  const drive = input.getDriveState();
  updateOverlay(drive, exhibits);
  updateNavigation(drive, stops, config);
  updateEasterEggToast(drive, eggs, config);
  updateScene(camera, dt);
  requestAnimationFrame(loop);
}

requestAnimationFrame(loop);
