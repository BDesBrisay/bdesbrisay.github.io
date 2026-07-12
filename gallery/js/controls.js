import { PointerLockControls } from 'three/addons/controls/PointerLockControls.js';
import { clamp } from './utils.js';

export function createInputManager({ domElement, camera, renderer, config, isMobile, getHoveredLink }) {
  const speed = config.movement.speed;
  const sensitivity = config.movement.lookSensitivity;

  if (isMobile) {
    return createMobileInput(domElement, camera, speed, sensitivity, getHoveredLink);
  }
  return createDesktopInput(domElement, camera, renderer, speed, sensitivity, getHoveredLink);
}

// ─── Desktop ──────────────────────────────────────────────

function createDesktopInput(domElement, camera, renderer, speed, sensitivity, getHoveredLink) {
  const controls = new PointerLockControls(camera, renderer.domElement);
  const keys = new Set();
  const hint = document.getElementById('desktop-hint');
  let lockFrame = 0;

  domElement.addEventListener('click', () => {
    if (!controls.isLocked) {
      controls.lock();
      lockFrame = 2;
    }
  });

  function onLinkClick() {
    if (!controls.isLocked || lockFrame > 0) return;
    const link = getHoveredLink();
    if (link) {
      controls.unlock();
      window.open(link.url, '_blank');
    }
  }
  document.addEventListener('mousedown', onLinkClick);

  controls.addEventListener('lock', () => {
    if (hint) hint.classList.add('hidden');
  });
  controls.addEventListener('unlock', () => {
    if (hint) hint.classList.remove('hidden');
  });

  function onKeyDown(e) { keys.add(e.code); }
  function onKeyUp(e) { keys.delete(e.code); }
  document.addEventListener('keydown', onKeyDown);
  document.addEventListener('keyup', onKeyUp);

  function update(dt) {
    if (lockFrame > 0) lockFrame--;
    if (!controls.isLocked) return;

    const forward = (keys.has('KeyW') || keys.has('ArrowUp') ? 1 : 0)
                  - (keys.has('KeyS') || keys.has('ArrowDown') ? 1 : 0);
    const strafe = (keys.has('KeyD') || keys.has('ArrowRight') ? 1 : 0)
                 - (keys.has('KeyA') || keys.has('ArrowLeft') ? 1 : 0);

    if (forward) controls.moveForward(forward * speed * dt);
    if (strafe) controls.moveRight(strafe * speed * dt);
  }

  function dispose() {
    document.removeEventListener('mousedown', onLinkClick);
    document.removeEventListener('keydown', onKeyDown);
    document.removeEventListener('keyup', onKeyUp);
    controls.dispose();
  }

  return { update, dispose };
}

// ─── Mobile ───────────────────────────────────────────────

function createMobileInput(domElement, camera, speed, sensitivity, getHoveredLink) {
  const infoModal = document.getElementById('controls-info');
  const dismissBtn = document.getElementById('controls-info-dismiss');
  const stickEl = document.getElementById('move-stick');
  const knobEl = document.getElementById('move-stick-knob');
  const lookEl = document.getElementById('look-pad');

  if (localStorage.getItem('gallery-controls-seen')) {
    infoModal?.classList.add('hidden');
  }
  dismissBtn?.addEventListener('click', () => {
    infoModal?.classList.add('hidden');
    localStorage.setItem('gallery-controls-seen', '1');
  });

  const stickState = { x: 0, z: 0, touchId: null };
  const lookState = { lastX: 0, lastY: 0, touchId: null };
  const stickRadius = 50;
  const deadZone = 0.15;

  // Tap detection for link clicks
  let tapStart = null;
  const TAP_THRESHOLD = 10;

  function getStickCenter() {
    const r = stickEl.getBoundingClientRect();
    return { cx: r.left + r.width / 2, cy: r.top + r.height / 2 };
  }

  stickEl.addEventListener('touchstart', (e) => {
    e.preventDefault();
    stickState.touchId = e.changedTouches[0].identifier;
  }, { passive: false });

  lookEl.addEventListener('touchstart', (e) => {
    e.preventDefault();
    const t = e.changedTouches[0];
    lookState.touchId = t.identifier;
    lookState.lastX = t.clientX;
    lookState.lastY = t.clientY;
  }, { passive: false });

  // Tap on canvas for link clicks
  domElement.addEventListener('touchstart', (e) => {
    if (e.target === domElement || e.target.tagName === 'CANVAS') {
      tapStart = { x: e.changedTouches[0].clientX, y: e.changedTouches[0].clientY, time: Date.now() };
    }
  }, { passive: true });

  domElement.addEventListener('touchend', (e) => {
    if (!tapStart) return;
    const t = e.changedTouches[0];
    const dx = t.clientX - tapStart.x;
    const dy = t.clientY - tapStart.y;
    const elapsed = Date.now() - tapStart.time;
    tapStart = null;

    if (Math.sqrt(dx * dx + dy * dy) < TAP_THRESHOLD && elapsed < 300) {
      const link = getHoveredLink();
      if (link) window.open(link.url, '_blank');
    }
  }, { passive: true });

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

        knobEl.style.transform = `translate(calc(-50% + ${dx}px), calc(-50% + ${dy}px))`;
        const norm = clamped / stickRadius;
        stickState.x = norm > deadZone ? (dx / stickRadius) : 0;
        stickState.z = norm > deadZone ? (dy / stickRadius) : 0;
      }

      if (t.identifier === lookState.touchId) {
        e.preventDefault();
        const dx = t.clientX - lookState.lastX;
        const dy = t.clientY - lookState.lastY;
        lookState.lastX = t.clientX;
        lookState.lastY = t.clientY;
        camera.rotation.y -= dx * sensitivity * 3;
        camera.rotation.x = clamp(camera.rotation.x - dy * sensitivity * 3, -Math.PI / 3, Math.PI / 3);
      }
    }
  }, { passive: false });

  function resetStick(e) {
    for (const t of e.changedTouches) {
      if (t.identifier === stickState.touchId) {
        stickState.touchId = null;
        stickState.x = 0;
        stickState.z = 0;
        knobEl.style.transform = 'translate(-50%, -50%)';
      }
      if (t.identifier === lookState.touchId) {
        lookState.touchId = null;
      }
    }
  }

  document.addEventListener('touchend', resetStick);
  document.addEventListener('touchcancel', resetStick);

  function update(dt) {
    if (stickState.x === 0 && stickState.z === 0) return;
    const yaw = camera.rotation.y;
    const sin = Math.sin(yaw);
    const cos = Math.cos(yaw);
    camera.position.x += (-stickState.z * sin + stickState.x * cos) * speed * dt;
    camera.position.z += (-stickState.z * cos - stickState.x * sin) * speed * dt;
  }

  function dispose() {
    document.removeEventListener('touchend', resetStick);
    document.removeEventListener('touchcancel', resetStick);
  }

  return { update, dispose };
}
