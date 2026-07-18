import * as THREE from 'three';
import { clamp } from './utils.js';

function latLonToVec3(lat, lon, radius) {
  const cosLat = Math.cos(lat);
  return new THREE.Vector3(
    radius * cosLat * Math.cos(lon),
    radius * Math.sin(lat),
    radius * cosLat * Math.sin(lon),
  );
}

function slerpDirection(a, b, t) {
  const va = a.clone().normalize();
  const vb = b.clone().normalize();
  const dot = clamp(va.dot(vb), -1, 1);
  const omega = Math.acos(dot);
  if (omega < 1e-6) return va.clone();
  const sinOmega = Math.sin(omega);
  const wa = Math.sin((1 - t) * omega) / sinOmega;
  const wb = Math.sin(t * omega) / sinOmega;
  return va.multiplyScalar(wa).add(vb.multiplyScalar(wb)).normalize();
}

function smoothstep(t) {
  const x = clamp(t, 0, 1);
  return x * x * (3 - 2 * x);
}

function sampleTourLatLon(t, stops, config) {
  if (stops.length < 2) {
    const s = stops[0];
    return { lat: s.lat, lon: s.lon };
  }
  const total = stops.length - 1;
  const scaled = clamp(t, 0, 1) * total;
  const i0 = Math.min(Math.floor(scaled), total - 1);
  const localT = smoothstep(scaled - i0);
  const a = stops[i0];
  const b = stops[i0 + 1];
  const dirA = latLonToVec3(a.lat, a.lon, 1);
  const dirB = latLonToVec3(b.lat, b.lon, 1);
  const dir = slerpDirection(dirA, dirB, localT);
  return {
    lat: Math.asin(clamp(dir.y, -1, 1)),
    lon: Math.atan2(dir.z, dir.x),
  };
}

function hash2D(x, y) {
  const s = Math.sin(x * 127.1 + y * 311.7) * 43758.5453;
  return s - Math.floor(s);
}

function noise2D(x, y) {
  const ix = Math.floor(x);
  const iy = Math.floor(y);
  const fx = x - ix;
  const fy = y - iy;
  const ux = fx * fx * (3 - 2 * fx);
  const uy = fy * fy * (3 - 2 * fy);

  const a = hash2D(ix, iy);
  const b = hash2D(ix + 1, iy);
  const c = hash2D(ix, iy + 1);
  const d = hash2D(ix + 1, iy + 1);

  return a * (1 - ux) * (1 - uy)
    + b * ux * (1 - uy)
    + c * (1 - ux) * uy
    + d * ux * uy;
}

function fbm(x, y, octaves = 3) {
  let value = 0;
  let amp = 0.5;
  let freq = 1;
  for (let i = 0; i < octaves; i++) {
    value += amp * noise2D(x * freq, y * freq);
    amp *= 0.5;
    freq *= 2;
  }
  return value;
}

let roadFlattenFn = null;

export function setRoadFlatten(stops, config) {
  roadFlattenFn = (lat, lon) => {
    if (!stops?.length) return 0;
    let minDist = Infinity;
    for (let t = 0; t <= 1; t += 0.02) {
      const { lat: plat, lon: plon } = sampleTourLatLon(t, stops, config);
      const dlat = lat - plat;
      let dlon = lon - plon;
      while (dlon > Math.PI) dlon -= Math.PI * 2;
      while (dlon < -Math.PI) dlon += Math.PI * 2;
      const dist = Math.sqrt(dlat * dlat + dlon * dlon);
      minDist = Math.min(minDist, dist);
    }
    const roadWidth = 0.16;
    if (minDist > roadWidth) return 0;
    const blend = 1 - minDist / roadWidth;
    return blend * blend;
  };
}

export function heightAt(lat, lon, config) {
  const amp = config.planet.heightAmplitude;
  const n = fbm(lat * 2.2 + 1.2, lon * 2.2 + 0.7, 3);
  const hills = (n - 0.35) * amp * 2;

  let flatten = 0;
  if (roadFlattenFn) flatten = roadFlattenFn(lat, lon);

  return hills * (1 - flatten * 0.85);
}

export function getSurfaceNormal(lat, lon, config) {
  const eps = 0.002;
  const h = heightAt(lat, lon, config);
  const hx = heightAt(lat + eps, lon, config);
  const hz = heightAt(lat, lon + eps, config);

  const p = latLonToVec3(lat, lon, config.planet.radius + h);
  const px = latLonToVec3(lat + eps, lon, config.planet.radius + hx);
  const pz = latLonToVec3(lat, lon + eps, config.planet.radius + hz);

  const tx = px.sub(p).normalize();
  const tz = pz.sub(p).normalize();
  return new THREE.Vector3().crossVectors(tz, tx).normalize();
}

export function displaceSphereGeometry(geometry, config, stops) {
  setRoadFlatten(stops, config);
  const pos = geometry.attributes.position;
  const colors = new Float32Array(pos.count * 3);
  const base = new THREE.Color(config.planet.baseColor);
  const dirt = new THREE.Color(config.planet.dirtColor);
  const tmp = new THREE.Vector3();

  for (let i = 0; i < pos.count; i++) {
    tmp.fromBufferAttribute(pos, i);
    const r = tmp.length();
    const lat = Math.asin(clamp(tmp.y / r, -1, 1));
    const lon = Math.atan2(tmp.z, tmp.x);
    const h = heightAt(lat, lon, config);
    tmp.normalize().multiplyScalar(config.planet.radius + h);
    pos.setXYZ(i, tmp.x, tmp.y, tmp.z);

    const n = fbm(lat * 3.5, lon * 3.5, 2);
    const c = base.clone().lerp(dirt, n * 0.6);
    colors[i * 3] = c.r;
    colors[i * 3 + 1] = c.g;
    colors[i * 3 + 2] = c.b;
  }

  geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
  geometry.computeVertexNormals();
  pos.needsUpdate = true;
}

export function applyZoneTints(geometry, stops, config) {
  const pos = geometry.attributes.position;
  const colors = geometry.attributes.color;
  if (!colors) return;

  const tmp = new THREE.Vector3();
  const tint = new THREE.Color();
  const base = new THREE.Color();

  for (let i = 0; i < pos.count; i++) {
    tmp.fromBufferAttribute(pos, i);
    const r = tmp.length();
    const lat = Math.asin(clamp(tmp.y / r, -1, 1));
    const lon = Math.atan2(tmp.z, tmp.x);

    base.fromArray(colors.array, i * 3);
    let influence = 0;
    let mixed = base.clone();

    for (const stop of stops) {
      const dlat = lat - stop.lat;
      let dlon = lon - stop.lon;
      while (dlon > Math.PI) dlon -= Math.PI * 2;
      while (dlon < -Math.PI) dlon += Math.PI * 2;
      const dist = Math.sqrt(dlat * dlat + dlon * dlon);
      const zone = config.area.zoneRadius / config.planet.radius;
      if (dist < zone) {
        const w = 1 - dist / zone;
        tint.set(stop.colors.primary);
        mixed.lerp(tint, w * 0.45);
        influence = Math.max(influence, w);
      }
    }

    colors.setXYZ(i, mixed.r, mixed.g, mixed.b);
  }
  colors.needsUpdate = true;
}

export function buildLakeMesh(config) {
  const { planet } = config;
  const segments = 32;
  const geo = new THREE.CircleGeometry(planet.lakeRadius, segments);
  const mat = new THREE.MeshStandardMaterial({
    color: planet.waterColor,
    metalness: 0.3,
    roughness: 0.2,
    transparent: true,
    opacity: 0.85,
  });
  const lake = new THREE.Mesh(geo, mat);
  const pos = latLonToVec3(planet.lakeLat, planet.lakeLon, planet.radius - 0.08);
  lake.position.copy(pos);

  const normal = pos.clone().normalize();
  const up = new THREE.Vector3(0, 1, 0);
  const quat = new THREE.Quaternion().setFromUnitVectors(up, normal);
  lake.quaternion.copy(quat);
  lake.rotateOnAxis(normal, 1.2);

  return lake;
}
