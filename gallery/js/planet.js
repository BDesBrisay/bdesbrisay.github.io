import * as THREE from 'three';
import { clamp } from './utils.js';
import { heightAt } from './terrain.js';

export function smoothstep(t) {
  const x = clamp(t, 0, 1);
  return x * x * (3 - 2 * x);
}

export function latLonToVec3(lat, lon, radius) {
  const cosLat = Math.cos(lat);
  return new THREE.Vector3(
    radius * cosLat * Math.cos(lon),
    radius * Math.sin(lat),
    radius * cosLat * Math.sin(lon),
  );
}

export function vec3ToLatLon(vec) {
  const r = vec.length();
  if (r < 1e-6) return { lat: 0, lon: 0, radius: 0 };
  return {
    lat: Math.asin(clamp(vec.y / r, -1, 1)),
    lon: Math.atan2(vec.z, vec.x),
    radius: r,
  };
}

export function slerpDirection(a, b, t) {
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

export function getSurfaceFrame(position, config) {
  const { lat, lon } = vec3ToLatLon(position);
  const normal = position.clone().normalize();
  const north = new THREE.Vector3(
    -Math.sin(lat) * Math.cos(lon),
    Math.cos(lat),
    -Math.sin(lat) * Math.sin(lon),
  ).normalize();
  const east = new THREE.Vector3().crossVectors(north, normal).normalize();
  north.crossVectors(normal, east).normalize();
  return { normal, east, north, lat, lon };
}

export function surfacePosition(lat, lon, config, hover = 0) {
  const r = config.planet.radius + heightAt(lat, lon, config) + hover;
  return latLonToVec3(lat, lon, r);
}

export function projectToSurface(vec, config, hover = 0) {
  const { lat, lon } = vec3ToLatLon(vec);
  return surfacePosition(lat, lon, config, hover);
}

export function buildSphereStops(exhibits, config) {
  const { area, planet } = config;
  const stops = [];

  for (let i = 0; i < exhibits.length; i++) {
    const exhibit = exhibits[i];
    const lat = area.tourLatStart + i * area.tourLatDrift;
    const lon = i * area.tourLonStep;
    const position = surfacePosition(lat, lon, config, config.drive.carHover);
    const frame = getSurfaceFrame(position, config);

    const nextLon = (i + 1) * area.tourLonStep;
    const nextLat = area.tourLatStart + (i + 1) * area.tourLatDrift;
    const nextPos = surfacePosition(
      i < exhibits.length - 1 ? nextLat : lat,
      i < exhibits.length - 1 ? nextLon : lon + 0.1,
      config,
      0,
    );
    const toNext = nextPos.clone().sub(position).projectOnPlane(frame.normal);
    const heading = Math.atan2(toNext.dot(frame.east), toNext.dot(frame.north));

    stops.push({
      index: i,
      exhibitId: exhibit.id,
      colors: exhibit.colors,
      lat,
      lon,
      position: { x: position.x, y: position.y, z: position.z },
      normal: { x: frame.normal.x, y: frame.normal.y, z: frame.normal.z },
      east: { x: frame.east.x, y: frame.east.y, z: frame.east.z },
      north: { x: frame.north.x, y: frame.north.y, z: frame.north.z },
      heading,
      zoneRadius: area.zoneRadius,
      revealRadius: area.revealRadius,
    });
  }

  return stops;
}

export function sampleTourPath(t, stops, config) {
  if (stops.length < 2) {
    const s = stops[0];
    return surfacePosition(s.lat, s.lon, config, config.planet.roadRaise);
  }

  const total = stops.length - 1;
  const scaled = clamp(t, 0, 1) * total;
  const i0 = Math.min(Math.floor(scaled), total - 1);
  const i1 = i0 + 1;
  const localT = smoothstep(scaled - i0);

  const a = stops[i0];
  const b = stops[i1];
  const dirA = latLonToVec3(a.lat, a.lon, 1);
  const dirB = latLonToVec3(b.lat, b.lon, 1);
  const dir = slerpDirection(dirA, dirB, localT);
  const lat = Math.asin(clamp(dir.y, -1, 1));
  const lon = Math.atan2(dir.z, dir.x);

  return surfacePosition(lat, lon, config, config.planet.roadRaise);
}

export function sampleTourPathPoints(stops, config, stepsPerSegment = 16) {
  const points = [];
  if (stops.length < 2) {
    if (stops.length === 1) {
      points.push(sampleTourPath(0, stops, config));
    }
    return points;
  }

  const segments = stops.length - 1;
  const totalSteps = segments * stepsPerSegment;
  for (let s = 0; s <= totalSteps; s++) {
    points.push(sampleTourPath(s / totalSteps, stops, config));
  }
  return points;
}

export function surfaceDistance(a, b, config) {
  const va = new THREE.Vector3(a.x, a.y, a.z).normalize();
  const vb = new THREE.Vector3(b.x, b.y, b.z).normalize();
  const angle = Math.acos(clamp(va.dot(vb), -1, 1));
  return angle * config.planet.radius;
}

export function getNearestStop(position, stops, config) {
  let best = null;
  let bestDist = Infinity;

  for (const stop of stops) {
    const dist = surfaceDistance(position, stop.position, config);
    if (dist < bestDist) {
      bestDist = dist;
      best = stop;
    }
  }

  if (!best) return { stop: null, distance: Infinity, weight: 0 };

  const weight = clamp(1 - bestDist / best.revealRadius, 0, 1);
  return { stop: best, distance: bestDist, weight };
}

export function orientToSurface(group, position, heading, config) {
  const frame = getSurfaceFrame(position, config);
  const normal = frame.normal;
  const forward = frame.north.clone().multiplyScalar(Math.cos(heading))
    .add(frame.east.clone().multiplyScalar(Math.sin(heading)))
    .normalize();

  const m = new THREE.Matrix4();
  const z = forward.clone();
  const x = new THREE.Vector3().crossVectors(normal, z).normalize();
  const y = normal.clone();
  z.crossVectors(x, y).normalize();
  m.makeBasis(x, y, z);
  group.quaternion.setFromRotationMatrix(m);
  group.position.copy(position);
}

export function getTourProgress(visitedIndices, stops) {
  let nextIndex = 0;
  for (let i = 0; i < stops.length; i++) {
    if (!visitedIndices.has(i)) {
      nextIndex = i;
      break;
    }
    nextIndex = i + 1;
  }

  const tourComplete = nextIndex >= stops.length;
  let compassIndex = nextIndex;
  if (!tourComplete && nextIndex === 0 && stops.length > 1) {
    compassIndex = 1;
  }
  const nextStop = tourComplete ? null : stops[compassIndex] ?? null;
  return { tourIndex: nextIndex, tourComplete, nextStop };
}
