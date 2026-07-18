import * as THREE from 'three';

function mat(color, opts = {}) {
  return new THREE.MeshStandardMaterial({
    color,
    metalness: opts.metalness ?? 0.2,
    roughness: opts.roughness ?? 0.6,
    emissive: opts.emissive,
    emissiveIntensity: opts.emissiveIntensity,
    transparent: opts.transparent,
    opacity: opts.opacity,
    side: opts.side,
  });
}

function buildProfileLandmark(colors) {
  const g = new THREE.Group();
  const tower = new THREE.Mesh(new THREE.CylinderGeometry(0.3, 0.5, 2.5, 8), mat(colors.primary));
  tower.position.y = 1.25;
  g.add(tower);
  const light = new THREE.Mesh(new THREE.SphereGeometry(0.4, 8, 8), mat('#ffe066', { emissive: '#ffaa00', emissiveIntensity: 0.6 }));
  light.position.y = 2.8;
  g.add(light);
  return g;
}

function buildInspectmindLandmark(colors) {
  const g = new THREE.Group();
  const craneBase = new THREE.Mesh(new THREE.BoxGeometry(1.2, 0.4, 1.2), mat(colors.primary));
  craneBase.position.y = 0.2;
  g.add(craneBase);
  const mast = new THREE.Mesh(new THREE.BoxGeometry(0.15, 2.8, 0.15), mat('#888'));
  mast.position.set(0.3, 1.6, 0);
  g.add(mast);
  const arm = new THREE.Mesh(new THREE.BoxGeometry(2.2, 0.12, 0.12), mat('#888'));
  arm.position.set(0.8, 2.8, 0);
  g.add(arm);
  const hat = new THREE.Mesh(new THREE.CylinderGeometry(0.5, 0.6, 0.35, 8), mat('#f4d03f'));
  hat.position.set(-0.5, 0.5, 0.4);
  g.add(hat);
  return g;
}

function buildReadyLandmark(colors) {
  const g = new THREE.Group();
  const pole = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.12, 3.2, 6), mat('#aaa'));
  pole.position.y = 1.6;
  g.add(pole);
  for (let i = 0; i < 3; i++) {
    const dish = new THREE.Mesh(new THREE.BoxGeometry(0.6 - i * 0.1, 0.05, 0.4), mat(colors.primary));
    dish.position.set(0.3, 2.2 + i * 0.35, 0);
    dish.rotation.z = -0.4;
    g.add(dish);
  }
  const box = new THREE.Mesh(new THREE.BoxGeometry(0.8, 0.5, 0.5), mat('#444'));
  box.position.y = 0.25;
  g.add(box);
  return g;
}

function buildBlazebuddiesLandmark(colors) {
  const g = new THREE.Group();
  const pit = new THREE.Mesh(new THREE.CylinderGeometry(0.8, 1, 0.2, 12), mat('#333'));
  pit.position.y = 0.1;
  g.add(pit);
  const flame = new THREE.Mesh(new THREE.ConeGeometry(0.35, 1.2, 6), mat(colors.primary, { emissive: colors.primary, emissiveIntensity: 0.4 }));
  flame.position.y = 0.8;
  g.add(flame);
  const bubble = new THREE.Mesh(new THREE.SphereGeometry(0.25, 8, 8), mat('#fff', { transparent: true, opacity: 0.7 }));
  bubble.position.set(0.5, 1.5, 0.2);
  g.add(bubble);
  return g;
}

function buildDonedingoLandmark(colors) {
  const g = new THREE.Group();
  const box = new THREE.Mesh(new THREE.BoxGeometry(0.7, 0.7, 0.7), mat(colors.primary));
  box.position.y = 0.5;
  g.add(box);
  const post = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.06, 1.4, 6), mat('#654'));
  post.position.set(0.6, 0.7, 0);
  g.add(post);
  const mail = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.35, 0.3), mat('#c44'));
  mail.position.set(0.6, 1.3, 0);
  g.add(mail);
  return g;
}

function buildSoapelyLandmark(colors) {
  const g = new THREE.Group();
  const arch = new THREE.Mesh(new THREE.TorusGeometry(1, 0.08, 6, 12, Math.PI), mat(colors.primary));
  arch.rotation.z = Math.PI / 2;
  arch.position.y = 1;
  g.add(arch);
  for (let i = 0; i < 4; i++) {
    const bubble = new THREE.Mesh(new THREE.SphereGeometry(0.15 + (i % 2) * 0.08, 6, 6), mat('#fff', { transparent: true, opacity: 0.6 }));
    bubble.position.set(-0.6 + i * 0.4, 1.6 + (i % 3) * 0.15, 0.2);
    g.add(bubble);
  }
  return g;
}

function buildAppearixLandmark(colors) {
  const g = new THREE.Group();
  const frame = new THREE.Mesh(new THREE.TorusGeometry(0.9, 0.06, 6, 4), mat(colors.primary));
  frame.rotation.x = Math.PI / 2;
  frame.position.y = 1.4;
  g.add(frame);
  const portal = new THREE.Mesh(new THREE.PlaneGeometry(1.2, 1.6), mat('#88ccff', { transparent: true, opacity: 0.5, side: THREE.DoubleSide }));
  portal.position.y = 1.4;
  g.add(portal);
  return g;
}

function buildPresearchLandmark(colors) {
  const g = new THREE.Group();
  const base = new THREE.Mesh(new THREE.CylinderGeometry(0.5, 0.6, 0.4, 8), mat('#555'));
  base.position.y = 0.2;
  g.add(base);
  const glass = new THREE.Mesh(new THREE.TorusGeometry(0.7, 0.08, 6, 16), mat(colors.primary));
  glass.rotation.x = Math.PI / 2;
  glass.position.y = 1.2;
  g.add(glass);
  const handle = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.06, 0.8, 6), mat('#333'));
  handle.position.set(0.5, 0.8, 0);
  handle.rotation.z = -Math.PI / 4;
  g.add(handle);
  return g;
}

function buildMagnifyprogressLandmark(colors) {
  const g = new THREE.Group();
  for (let i = 0; i < 3; i++) {
    const bar = new THREE.Mesh(new THREE.BoxGeometry(0.35, 0.5 + i * 0.6, 0.35), mat(colors.primary));
    bar.position.set(-0.4 + i * 0.4, (0.5 + i * 0.6) / 2, 0);
    g.add(bar);
  }
  const arrow = new THREE.Mesh(new THREE.ConeGeometry(0.3, 0.6, 4), mat('#fff'));
  arrow.position.y = 2.5;
  g.add(arrow);
  return g;
}

function buildRealidLandmark(colors) {
  const g = new THREE.Group();
  const kiosk = new THREE.Mesh(new THREE.BoxGeometry(0.8, 1.6, 0.5), mat('#444'));
  kiosk.position.y = 0.8;
  g.add(kiosk);
  const screen = new THREE.Mesh(new THREE.PlaneGeometry(0.5, 0.35), mat(colors.primary, { emissive: colors.primary, emissiveIntensity: 0.3 }));
  screen.position.set(0, 1.1, 0.26);
  g.add(screen);
  const card = new THREE.Mesh(new THREE.BoxGeometry(0.4, 0.25, 0.02), mat('#fff'));
  card.position.set(0, 0.9, 0.35);
  card.rotation.x = -0.3;
  g.add(card);
  return g;
}

function buildHarvixLandmark(colors) {
  const g = new THREE.Group();
  const monitor = new THREE.Mesh(new THREE.BoxGeometry(1.2, 0.9, 0.1), mat('#222'));
  monitor.position.y = 1.2;
  g.add(monitor);
  const screen = new THREE.Mesh(new THREE.PlaneGeometry(1, 0.7), mat(colors.primary, { emissive: colors.primary, emissiveIntensity: 0.2 }));
  screen.position.set(0, 1.2, 0.06);
  g.add(screen);
  const stand = new THREE.Mesh(new THREE.BoxGeometry(0.3, 0.4, 0.3), mat('#333'));
  stand.position.y = 0.4;
  g.add(stand);
  const ant = new THREE.Mesh(new THREE.CylinderGeometry(0.02, 0.02, 0.8, 4), mat('#888'));
  ant.position.set(0, 2.2, 0);
  g.add(ant);
  return g;
}

const BUILDERS = {
  profile: buildProfileLandmark,
  inspectmind: buildInspectmindLandmark,
  ready: buildReadyLandmark,
  blazebuddies: buildBlazebuddiesLandmark,
  donedingo: buildDonedingoLandmark,
  soapely: buildSoapelyLandmark,
  appearix: buildAppearixLandmark,
  presearch: buildPresearchLandmark,
  magnifyprogress: buildMagnifyprogressLandmark,
  realid: buildRealidLandmark,
  harvix: buildHarvixLandmark,
};

export function buildLandmark(exhibitId, colors) {
  const builder = BUILDERS[exhibitId];
  if (builder) return builder(colors);
  const fallback = new THREE.Mesh(new THREE.BoxGeometry(0.6, 1.2, 0.6), mat(colors.primary));
  fallback.position.y = 0.6;
  const g = new THREE.Group();
  g.add(fallback);
  return g;
}

function createLabelTexture(text, colors) {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 128;
  const ctx = canvas.getContext('2d');

  ctx.fillStyle = colors.primary;
  ctx.beginPath();
  if (typeof ctx.roundRect === 'function') {
    ctx.roundRect(8, 8, 496, 112, 12);
  } else {
    ctx.rect(8, 8, 496, 112);
  }
  ctx.fill();

  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 36px system-ui, sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';

  let display = text;
  while (ctx.measureText(display).width > 460 && display.length > 3) {
    display = `${display.slice(0, -4)}…`;
  }
  ctx.fillText(display, 256, 64);

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}

export function buildLandmarkArch(title, colors, config) {
  const { landmark, planet } = config;
  const archWidth = landmark?.archWidth ?? planet.roadWidth * 2.2;
  const archHeight = landmark?.archHeight ?? 3.5;
  const pillarW = landmark?.pillarWidth ?? 0.25;
  const labelH = landmark?.labelHeight ?? 0.6;
  const halfW = archWidth / 2;

  const g = new THREE.Group();
  const pillarMat = mat(colors.primary);
  const lintelMat = mat(colors.primary, { metalness: 0.35 });

  const pillarGeo = new THREE.BoxGeometry(pillarW, archHeight, pillarW);
  const leftPillar = new THREE.Mesh(pillarGeo, pillarMat);
  leftPillar.position.set(-halfW + pillarW / 2, archHeight / 2, 0);
  g.add(leftPillar);

  const rightPillar = new THREE.Mesh(pillarGeo, pillarMat);
  rightPillar.position.set(halfW - pillarW / 2, archHeight / 2, 0);
  g.add(rightPillar);

  const lintel = new THREE.Mesh(
    new THREE.BoxGeometry(archWidth, pillarW * 1.2, pillarW * 1.4),
    lintelMat,
  );
  lintel.position.y = archHeight;
  g.add(lintel);

  const labelTex = createLabelTexture(title, colors);
  const labelAspect = 512 / 128;
  const labelW = archWidth * 0.92;
  const labelPlane = new THREE.Mesh(
    new THREE.PlaneGeometry(labelW, labelW / labelAspect),
    new THREE.MeshBasicMaterial({ map: labelTex, transparent: true }),
  );
  labelPlane.position.set(0, archHeight + labelH * 0.5 + pillarW * 0.3, pillarW * 0.8);
  g.add(labelPlane);

  g.userData.openingWidth = archWidth;
  return g;
}

export function buildZoneRing(colors, radius = 4) {
  const geo = new THREE.RingGeometry(radius * 0.7, radius, 32);
  const matRing = new THREE.MeshBasicMaterial({
    color: colors.primary,
    transparent: true,
    opacity: 0.35,
    side: THREE.DoubleSide,
  });
  return new THREE.Mesh(geo, matRing);
}

export function buildEasterEggMarker(egg) {
  const g = new THREE.Group();
  const post = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.05, 1.2, 6), mat('#654321'));
  post.position.y = 0.6;
  g.add(post);
  const sign = new THREE.Mesh(new THREE.BoxGeometry(0.8, 0.5, 0.04), mat('#f4f6f8'));
  sign.position.y = 1.2;
  g.add(sign);
  g.userData = { egg };
  return g;
}
