import * as THREE from 'three';
import { clamp } from './utils.js';
import {
  getSurfaceFrame,
  projectToSurface,
  getNearestStop,
  getTourProgress,
  surfacePosition,
  vec3ToLatLon,
} from './planet.js';
import { orientToSurface } from './planet.js';

export function createInputManager({
  domElement,
  camera,
  renderer,
  config,
  isMobile,
  car,
  stops,
  getHoveredLink,
}) {
  if (isMobile) {
    return createMobileDrive({ domElement, camera, config, car, stops, getHoveredLink });
  }
  return createDesktopDrive({ domElement, camera, renderer, config, car, stops, getHoveredLink });
}

function createDriveState(stops, config) {
  const first = stops[0];
  const pos = surfacePosition(first.lat, first.lon, config, config.drive.carHover);

  return {
    position: new THREE.Vector3(pos.x, pos.y, pos.z),
    heading: first.heading,
    speed: 0,
    visited: new Set([0]),
    nearestStop: first,
    proximityWeight: 0,
    tourIndex: 0,
    tourComplete: false,
    camYawOffset: 0,
    camPitch: 0.15,
  };
}

function updateDrivePhysics(state, input, car, camera, dt, config, stops) {
  const { drive } = config;
  const frame = getSurfaceFrame(state.position, config);

  if (input.steer) state.heading += input.steer * drive.turnRate * dt * (0.5 + Math.abs(state.speed) / drive.maxSpeed);
  if (input.throttle) {
    state.speed += input.throttle * drive.acceleration * dt;
  }
  if (input.brake) {
    state.speed -= Math.sign(state.speed || 1) * drive.brakeDecel * dt;
    if (Math.abs(state.speed) < 0.1) state.speed = 0;
  }

  state.speed = clamp(state.speed, -drive.maxSpeed * 0.4, drive.maxSpeed);

  if (Math.abs(state.speed) > 0.01) {
    const forward = frame.north.clone().multiplyScalar(Math.cos(state.heading))
      .add(frame.east.clone().multiplyScalar(Math.sin(state.heading)));
    state.position.addScaledVector(forward, state.speed * dt);
    state.position.copy(projectToSurface(state.position, config, drive.carHover));
  }

  const nearest = getNearestStop(state.position, stops, config);
  state.nearestStop = nearest.stop;
  state.proximityWeight = nearest.weight;

  if (nearest.stop && nearest.distance < nearest.stop.zoneRadius) {
    state.visited.add(nearest.stop.index);
  }

  const tour = getTourProgress(state.visited, stops);
  state.tourIndex = tour.tourIndex;
  state.tourComplete = tour.tourComplete;

  orientToSurface(car, state.position, state.heading, config);

  const carFrame = getSurfaceFrame(state.position, config);
  const carForward = carFrame.north.clone().multiplyScalar(Math.cos(state.heading))
    .add(carFrame.east.clone().multiplyScalar(Math.sin(state.heading)))
    .normalize();

  const WORLD_UP = new THREE.Vector3(0, 1, 0);
  const horizontalForward = carForward.clone().projectOnPlane(WORLD_UP);
  if (horizontalForward.lengthSq() < 1e-6) {
    horizontalForward.copy(carFrame.east).projectOnPlane(WORLD_UP).normalize();
  } else {
    horizontalForward.normalize();
  }

  const camBack = horizontalForward.clone().multiplyScalar(-drive.cameraDistance);
  const camTarget = state.position.clone()
    .add(camBack)
    .add(WORLD_UP.clone().multiplyScalar(drive.cameraHeight));

  const camRight = new THREE.Vector3().crossVectors(WORLD_UP, horizontalForward).normalize();
  const yawOff = state.camYawOffset || 0;
  camTarget.add(camRight.clone().multiplyScalar(Math.sin(yawOff) * 2));

  const lag = 1 - Math.exp(-drive.cameraLag * dt);
  camera.position.lerp(camTarget, lag);

  const lookAhead = horizontalForward.clone().multiplyScalar(4);
  const lookAt = state.position.clone().add(lookAhead);
  lookAt.y += Math.sin(state.camPitch) * 2;
  camera.up.copy(WORLD_UP);
  camera.lookAt(lookAt);

  return state;
}

function createDesktopDrive({ domElement, camera, renderer, config, car, stops, getHoveredLink }) {
  const state = createDriveState(stops, config);
  const keys = new Set();
  const hint = document.getElementById('desktop-hint');
  let pointerLocked = false;
  let lockFrame = 0;

  function onKeyDown(e) { keys.add(e.code); }
  function onKeyUp(e) { keys.delete(e.code); }
  document.addEventListener('keydown', onKeyDown);
  document.addEventListener('keyup', onKeyUp);

  domElement.addEventListener('click', () => {
    if (!pointerLocked) {
      renderer.domElement.requestPointerLock();
    }
  });

  document.addEventListener('pointerlockchange', () => {
    pointerLocked = document.pointerLockElement === renderer.domElement;
    if (hint) hint.classList.toggle('hidden', pointerLocked);
  });

  document.addEventListener('mousemove', (e) => {
    if (!pointerLocked) return;
    state.camYawOffset -= e.movementX * config.movement.lookSensitivity;
    state.camPitch = clamp(state.camPitch - e.movementY * config.movement.lookSensitivity, -0.4, 0.6);
  });

  document.addEventListener('mousedown', (e) => {
    if (!pointerLocked || lockFrame > 0) return;
    const link = getHoveredLink?.();
    if (link) {
      document.exitPointerLock();
      window.open(link.url, '_blank');
    }
  });

  function getInput() {
    const throttle = (keys.has('KeyW') || keys.has('ArrowUp') ? 1 : 0)
      - (keys.has('KeyS') || keys.has('ArrowDown') ? 1 : 0);
    const steer = (keys.has('KeyD') || keys.has('ArrowRight') ? 1 : 0)
      - (keys.has('KeyA') || keys.has('ArrowLeft') ? 1 : 0);
    const brake = keys.has('Space') ? 1 : 0;
    return { throttle, steer, brake };
  }

  function update(dt) {
    if (lockFrame > 0) lockFrame--;
    updateDrivePhysics(state, getInput(), car, camera, dt, config, stops);
  }

  function getDriveState() {
    const { lat, lon } = vec3ToLatLon(state.position);
    const tour = getTourProgress(state.visited, stops);
    return {
      position: { x: state.position.x, y: state.position.y, z: state.position.z },
      lat,
      lon,
      heading: state.heading,
      speed: state.speed,
      nearestStop: state.nearestStop,
      proximityWeight: state.proximityWeight,
      tourIndex: tour.tourIndex,
      tourComplete: tour.tourComplete,
      nextStop: tour.nextStop,
      visited: state.visited,
    };
  }

  function dispose() {
    document.removeEventListener('keydown', onKeyDown);
    document.removeEventListener('keyup', onKeyUp);
  }

  return { update, getDriveState, dispose };
}

function createMobileDrive({ domElement, camera, config, car, stops, getHoveredLink }) {
  const state = createDriveState(stops, config);
  const infoModal = document.getElementById('controls-info');
  const dismissBtn = document.getElementById('controls-info-dismiss');
  if (localStorage.getItem('gallery-controls-seen')) {
    infoModal?.classList.add('hidden');
  }
  dismissBtn?.addEventListener('click', () => {
    infoModal?.classList.add('hidden');
    localStorage.setItem('gallery-controls-seen', '1');
  });
  const stickEl = document.getElementById('move-stick');
  const knobEl = document.getElementById('move-stick-knob');
  const lookEl = document.getElementById('look-pad');
  const stickState = { x: 0, y: 0, touchId: null };
  const lookState = { lastX: 0, lastY: 0, touchId: null };
  const stickRadius = 50;
  const deadZone = 0.15;

  function getStickCenter() {
    const r = stickEl.getBoundingClientRect();
    return { cx: r.left + r.width / 2, cy: r.top + r.height / 2 };
  }

  stickEl?.addEventListener('touchstart', (e) => {
    e.preventDefault();
    stickState.touchId = e.changedTouches[0].identifier;
  }, { passive: false });

  lookEl?.addEventListener('touchstart', (e) => {
    e.preventDefault();
    const t = e.changedTouches[0];
    lookState.touchId = t.identifier;
    lookState.lastX = t.clientX;
    lookState.lastY = t.clientY;
  }, { passive: false });

  document.addEventListener('touchmove', (e) => {
    for (const t of e.changedTouches) {
      if (t.identifier === stickState.touchId) {
        e.preventDefault();
        const { cx, cy } = getStickCenter();
        let dx = t.clientX - cx;
        let dy = t.clientY - cy;
        const dist = Math.sqrt(dx * dx + dy * dy);
        const clamped = Math.min(dist, stickRadius);
        const angle = Math.atan2(dy, dx);
        dx = Math.cos(angle) * clamped;
        dy = Math.sin(angle) * clamped;
        if (knobEl) knobEl.style.transform = `translate(calc(-50% + ${dx}px), calc(-50% + ${dy}px))`;
        const norm = clamped / stickRadius;
        stickState.x = norm > deadZone ? dx / stickRadius : 0;
        stickState.y = norm > deadZone ? -dy / stickRadius : 0;
      }
      if (t.identifier === lookState.touchId) {
        e.preventDefault();
        const dx = t.clientX - lookState.lastX;
        const dy = t.clientY - lookState.lastY;
        lookState.lastX = t.clientX;
        lookState.lastY = t.clientY;
        state.camYawOffset -= dx * config.movement.lookSensitivity * 3;
        state.camPitch = clamp(state.camPitch - dy * config.movement.lookSensitivity * 3, -0.4, 0.6);
      }
    }
  }, { passive: false });

  function resetTouch(e) {
    for (const t of e.changedTouches) {
      if (t.identifier === stickState.touchId) {
        stickState.touchId = null;
        stickState.x = 0;
        stickState.y = 0;
        if (knobEl) knobEl.style.transform = 'translate(-50%, -50%)';
      }
      if (t.identifier === lookState.touchId) lookState.touchId = null;
    }
  }
  document.addEventListener('touchend', resetTouch);
  document.addEventListener('touchcancel', resetTouch);

  domElement.addEventListener('touchend', (e) => {
    const link = getHoveredLink?.();
    if (link) window.open(link.url, '_blank');
  }, { passive: true });

  function update(dt) {
    const input = {
      throttle: stickState.y,
      steer: stickState.x,
      brake: 0,
    };
    updateDrivePhysics(state, input, car, camera, dt, config, stops);
  }

  function getDriveState() {
    const { lat, lon } = vec3ToLatLon(state.position);
    const tour = getTourProgress(state.visited, stops);
    return {
      position: { x: state.position.x, y: state.position.y, z: state.position.z },
      lat,
      lon,
      heading: state.heading,
      speed: state.speed,
      nearestStop: state.nearestStop,
      proximityWeight: state.proximityWeight,
      tourIndex: tour.tourIndex,
      tourComplete: tour.tourComplete,
      nextStop: tour.nextStop,
      visited: state.visited,
    };
  }

  return { update, getDriveState, dispose: () => {} };
}
