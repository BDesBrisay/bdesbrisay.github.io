import { GALLERY_CONFIG, PROFILE_EXHIBIT } from './config.js';
import { buildExhibits, resolveRooms } from './exhibits.js';
import { initScene } from './scene.js';
import { createInputManager } from './controls.js';
import { isMobileUI } from './utils.js';

if (typeof PROJECTS === 'undefined' || !PROJECTS.length) {
  throw new Error('PROJECTS.js not loaded — make sure ../PROJECTS.js is included before this module.');
}

const config = GALLERY_CONFIG;
const mobile = isMobileUI();

const exhibits = buildExhibits(PROJECTS, PROFILE_EXHIBIT, config);
const { rooms, corridorDepth } = resolveRooms(exhibits, config);

console.log(`Gallery: ${rooms.length} rooms, corridor ${corridorDepth.toFixed(1)}m`);

const container = document.getElementById('canvas-container');
const { camera, renderer, update: updateScene, getHoveredLink } = await initScene(
  container, exhibits, rooms, corridorDepth, config,
);

const input = createInputManager({
  domElement: container,
  camera,
  renderer,
  config,
  isMobile: mobile,
  getHoveredLink,
});

let prev = performance.now();

function loop(now) {
  const dt = Math.min((now - prev) / 1000, 0.1);
  prev = now;
  input.update(dt);
  updateScene(camera, dt);
  requestAnimationFrame(loop);
}

requestAnimationFrame(loop);
