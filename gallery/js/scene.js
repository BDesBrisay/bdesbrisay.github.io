import * as THREE from 'three';
import { darken } from './utils.js';
import {
  getSurfaceFrame,
  orientToSurface,
  sampleTourPathPoints,
  surfacePosition,
} from './planet.js';
import {
  displaceSphereGeometry,
  applyZoneTints,
  buildLakeMesh,
  setRoadFlatten,
} from './terrain.js';
import { buildLandmark, buildZoneRing, buildLandmarkArch, buildEasterEggMarker } from './landmarks.js';

const _tmpFwd = new THREE.Vector3();
const _tmpUp = new THREE.Vector3();
const _tmpRight = new THREE.Vector3();
const _tmpLeft = new THREE.Vector3();
const _tmpRgt = new THREE.Vector3();
const _tmpToCar = new THREE.Vector3();

function roadMaterial(color, config) {
  return new THREE.MeshStandardMaterial({
    color,
    roughness: 0.65,
    metalness: 0.08,
    polygonOffset: true,
    polygonOffsetFactor: -1,
    polygonOffsetUnits: -1,
  });
}

function buildRibbonMesh(points, halfW, material) {
  if (points.length < 2) return null;

  const vertices = [];
  const indices = [];

  for (let i = 0; i < points.length; i++) {
    const p = points[i];
    _tmpUp.copy(p).normalize();

    if (i < points.length - 1) {
      _tmpFwd.copy(points[i + 1]).sub(p).normalize();
    } else {
      _tmpFwd.copy(p).sub(points[i - 1]).normalize();
    }
    _tmpRight.crossVectors(_tmpFwd, _tmpUp).normalize();

    _tmpLeft.copy(p).addScaledVector(_tmpRight, -halfW);
    _tmpRgt.copy(p).addScaledVector(_tmpRight, halfW);
    vertices.push(_tmpLeft.x, _tmpLeft.y, _tmpLeft.z, _tmpRgt.x, _tmpRgt.y, _tmpRgt.z);
  }

  for (let i = 0; i < points.length - 1; i++) {
    const a = i * 2;
    const b = i * 2 + 1;
    const c = (i + 1) * 2;
    const d = (i + 1) * 2 + 1;
    indices.push(a, c, b, b, c, d);
  }

  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3));
  geo.setIndex(indices);
  geo.computeVertexNormals();

  const mesh = new THREE.Mesh(geo, material);
  mesh.renderOrder = 1;
  return mesh;
}

function offsetPathPoints(basePoints, lateralOffset, raiseExtra = 0) {
  const out = [];

  for (let i = 0; i < basePoints.length; i++) {
    const p = basePoints[i];
    _tmpUp.copy(p).normalize();

    if (i < basePoints.length - 1) {
      _tmpFwd.copy(basePoints[i + 1]).sub(p).normalize();
    } else {
      _tmpFwd.copy(p).sub(basePoints[i - 1]).normalize();
    }
    _tmpRight.crossVectors(_tmpFwd, _tmpUp).normalize();

    const offset = p.clone().addScaledVector(_tmpRight, lateralOffset);
    if (raiseExtra !== 0) {
      offset.addScaledVector(_tmpUp, raiseExtra);
    }
    out.push(offset);
  }
  return out;
}

function buildCenterDashes(scene, basePoints, config) {
  const { planet } = config;
  const dashLen = 1.2;
  const gapLen = 0.8;
  const halfW = 0.06;
  const mat = roadMaterial(planet.roadCenterColor, config);
  let acc = 0;
  let drawing = true;

  for (let i = 0; i < basePoints.length - 1; i++) {
    const a = basePoints[i];
    const b = basePoints[i + 1];
    const segLen = a.distanceTo(b);
    let t = 0;

    while (t < segLen) {
      const chunk = drawing ? dashLen : gapLen;
      const tEnd = Math.min(t + chunk, segLen);
      if (drawing && tEnd - t > 0.05) {
        const p0 = a.clone().lerp(b, t / segLen);
        const p1 = a.clone().lerp(b, tEnd / segLen);
        _tmpUp.copy(p0).normalize();
        _tmpFwd.copy(p1).sub(p0).normalize();
        if (_tmpFwd.lengthSq() > 1e-6) {
          _tmpRight.crossVectors(_tmpFwd, _tmpUp).normalize();
          p0.addScaledVector(_tmpUp, planet.roadRaise * 0.08);
          p1.addScaledVector(_tmpUp, planet.roadRaise * 0.08);
          const dash = buildRibbonMesh([p0, p1], halfW, mat);
          if (dash) scene.add(dash);
        }
      }
      t = tEnd;
      drawing = !drawing;
      acc += chunk;
      if (acc > 500) break;
    }
  }
}

function buildSky(scene, config) {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 512;
  const ctx = canvas.getContext('2d');
  const grad = ctx.createLinearGradient(0, 0, 0, 512);
  grad.addColorStop(0, config.sky.nebulaColors[0]);
  grad.addColorStop(0.5, config.sky.nebulaColors[1]);
  grad.addColorStop(1, config.sky.nebulaColors[2]);
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, 512, 512);

  const tex = new THREE.CanvasTexture(canvas);
  scene.background = tex;

  const auroraGeo = new THREE.PlaneGeometry(200, 60);
  const auroraMat = new THREE.MeshBasicMaterial({
    color: 0x00ffaa,
    transparent: true,
    opacity: 0.15,
    side: THREE.DoubleSide,
    depthWrite: false,
  });
  const aurora1 = new THREE.Mesh(auroraGeo, auroraMat);
  aurora1.position.set(0, 80, -120);
  aurora1.rotation.x = -0.3;
  scene.add(aurora1);

  const aurora2 = aurora1.clone();
  aurora2.material = auroraMat.clone();
  aurora2.material.color.set('#aa00ff');
  aurora2.material.opacity = 0.1;
  aurora2.position.set(40, 60, -100);
  aurora2.rotation.z = 0.4;
  scene.add(aurora2);

  return { aurora1, aurora2 };
}

function buildPlanetMesh(stops, config) {
  const geo = new THREE.SphereGeometry(
    config.planet.radius,
    config.planet.segments,
    config.planet.segments,
  );
  setRoadFlatten(stops, config);
  displaceSphereGeometry(geo, config, stops);
  applyZoneTints(geo, stops, config);

  const mat = new THREE.MeshStandardMaterial({
    vertexColors: true,
    roughness: 0.85,
    metalness: 0.05,
    side: THREE.FrontSide,
    flatShading: false,
  });
  const mesh = new THREE.Mesh(geo, mat);
  mesh.renderOrder = 0;
  return mesh;
}

function buildSurfaceRoad(scene, stops, config) {
  const basePoints = sampleTourPathPoints(stops, config, 12);
  if (basePoints.length < 2) return;

  const { planet } = config;
  const halfW = planet.roadWidth / 2;
  const shoulderOffset = halfW + 0.15;
  const shoulderHalfW = 0.22;

  const asphaltPoints = offsetPathPoints(basePoints, 0);
  const asphalt = buildRibbonMesh(asphaltPoints, halfW, roadMaterial(planet.roadColor, config));
  if (asphalt) scene.add(asphalt);

  const leftShoulder = offsetPathPoints(basePoints, -shoulderOffset, -0.04);
  const rightShoulder = offsetPathPoints(basePoints, shoulderOffset, -0.04);
  const leftMesh = buildRibbonMesh(leftShoulder, shoulderHalfW, roadMaterial(planet.roadEdgeColor, config));
  const rightMesh = buildRibbonMesh(rightShoulder, shoulderHalfW, roadMaterial(planet.roadEdgeColor, config));
  if (leftMesh) scene.add(leftMesh);
  if (rightMesh) scene.add(rightMesh);

  buildCenterDashes(scene, basePoints, config);
}

export function buildCar(config) {
  const car = new THREE.Group();
  const bodyMat = new THREE.MeshStandardMaterial({ color: '#e74c3c', metalness: 0.4, roughness: 0.5 });
  const trimMat = new THREE.MeshStandardMaterial({ color: '#2c3e50', metalness: 0.3, roughness: 0.6 });

  const body = new THREE.Mesh(new THREE.BoxGeometry(1.4, 0.5, 2.2), bodyMat);
  body.position.y = 0.45;
  car.add(body);

  const cabin = new THREE.Mesh(new THREE.BoxGeometry(1.1, 0.45, 1.2), trimMat);
  cabin.position.set(0, 0.85, -0.1);
  car.add(cabin);

  const wheelGeo = new THREE.CylinderGeometry(0.22, 0.22, 0.15, 10);
  const wheelMat = new THREE.MeshStandardMaterial({ color: '#111' });
  const wheelPos = [
    [-0.55, 0.22, 0.7], [0.55, 0.22, 0.7],
    [-0.55, 0.22, -0.7], [0.55, 0.22, -0.7],
  ];
  for (const [x, y, z] of wheelPos) {
    const w = new THREE.Mesh(wheelGeo, wheelMat);
    w.rotation.z = Math.PI / 2;
    w.position.set(x, y, z);
    car.add(w);
  }

  return car;
}

function buildZoneLandmarks(scene, exhibits, stops, config) {
  const exhibitMap = new Map(exhibits.map(e => [e.id, e]));
  const landmarkGroups = [];

  for (const stop of stops) {
    const exhibit = exhibitMap.get(stop.exhibitId);
    if (!exhibit) continue;

    const pos = surfacePosition(stop.lat, stop.lon, config, 0.05);
    const zoneGroup = new THREE.Group();

    const ring = buildZoneRing(exhibit.colors, 2.2);
    ring.rotation.x = Math.PI / 2;
    zoneGroup.add(ring);

    const arch = buildLandmarkArch(exhibit.title, exhibit.colors, config);
    zoneGroup.add(arch);

    const landmark = buildLandmark(stop.exhibitId, exhibit.colors);
    landmark.scale.setScalar(0.85);
    zoneGroup.add(landmark);

    orientToSurface(zoneGroup, pos, stop.heading, config);
    zoneGroup.userData.isLandmark = true;
    scene.add(zoneGroup);
    landmarkGroups.push(zoneGroup);
  }

  return landmarkGroups;
}

function buildEasterEggs(scene, eggs, config) {
  for (const egg of eggs) {
    const pos = surfacePosition(egg.lat, egg.lon, config, 0.05);
    const marker = buildEasterEggMarker(egg);
    orientToSurface(marker, pos, 0, config);
    scene.add(marker);
  }
}

function updateLandmarkBillboards(landmarkGroups, carPosition, config) {
  if (!carPosition || !landmarkGroups?.length) return;

  const carPos = new THREE.Vector3(carPosition.x, carPosition.y, carPosition.z);

  for (const group of landmarkGroups) {
    const frame = getSurfaceFrame(group.position, config);
    _tmpToCar.copy(carPos).sub(group.position).projectOnPlane(frame.normal);
    if (_tmpToCar.lengthSq() < 0.01) continue;

    const heading = Math.atan2(_tmpToCar.dot(frame.east), _tmpToCar.dot(frame.north));
    orientToSurface(group, group.position, heading, config);
  }
}

function addPlanetLighting(scene) {
  scene.add(new THREE.AmbientLight(0xffffff, 0.45));
  scene.add(new THREE.HemisphereLight(0x88aaff, 0x334422, 0.35));
  const sun = new THREE.DirectionalLight(0xfff5e0, 1.1);
  sun.position.set(60, 40, 30);
  scene.add(sun);
}

export async function initScene(container, exhibits, stops, eggs, config, getDriveState) {
  const renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.setSize(container.clientWidth, container.clientHeight);
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  container.appendChild(renderer.domElement);

  const scene = new THREE.Scene();
  const fogDensity = config.planet.fogDensity ?? 0.005;
  scene.fog = new THREE.FogExp2(0x0d0b18, fogDensity);
  const sky = buildSky(scene, config);

  const planet = buildPlanetMesh(stops, config);
  scene.add(planet);

  const lake = buildLakeMesh(config);
  scene.add(lake);

  buildSurfaceRoad(scene, stops, config);
  const landmarkGroups = buildZoneLandmarks(scene, exhibits, stops, config);
  buildEasterEggs(scene, eggs, config);
  addPlanetLighting(scene);

  const car = buildCar(config);
  scene.add(car);

  const camera = new THREE.PerspectiveCamera(
    70,
    container.clientWidth / container.clientHeight,
    0.1,
    600,
  );

  const first = stops[0];
  const startPos = surfacePosition(first.lat, first.lon, config, config.drive.carHover);
  orientToSurface(car, startPos, first.heading, config);

  const targetBgColor = new THREE.Color();
  let auroraPhase = 0;

  window.addEventListener('resize', () => {
    camera.aspect = container.clientWidth / container.clientHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(container.clientWidth, container.clientHeight);
  });

  function update(cam, dt) {
    const drive = getDriveState();
    auroraPhase += dt * 0.15;
    if (sky.aurora1) {
      sky.aurora1.material.opacity = 0.12 + Math.sin(auroraPhase) * 0.04;
      sky.aurora2.material.opacity = 0.08 + Math.cos(auroraPhase * 0.7) * 0.03;
    }

    if (drive?.position) {
      updateLandmarkBillboards(landmarkGroups, drive.position, config);
    }

    if (drive?.nearestStop?.colors) {
      const bg = darken(drive.nearestStop.colors.background, 0.55);
      targetBgColor.set(bg);
      const t = 1 - Math.exp(-2 * dt);
      if (scene.fog) {
        scene.fog.color.lerp(targetBgColor, t);
      }
    }

    renderer.render(scene, cam);
  }

  return { camera, renderer, scene, car, update };
}
