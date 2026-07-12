type Vec3 = {
  x: number;
  y: number;
  z: number;
};

export type LockedCameraFrame = {
  target: Vec3;
  position: Vec3;
  distance: number;
  worldTop: number;
};

function clamp(value: number, min: number, max: number): number {
  if (value < min) {
    return min;
  }
  if (value > max) {
    return max;
  }
  return value;
}

export function computeLockedCameraFrame(heightMeters: number, heightScale: number): LockedCameraFrame {
  const worldTop = Math.max(1, heightMeters * heightScale);
  const targetY = worldTop * 0.5;
  const distance = clamp(worldTop * 1.55, 85, 350);

  const yaw = Math.PI * 0.25;
  const pitch = Math.PI * 0.19;
  const horizontal = distance * Math.cos(pitch);

  const x = Math.sin(yaw) * horizontal;
  const y = targetY + distance * Math.sin(pitch);
  const z = Math.cos(yaw) * horizontal;

  return {
    target: { x: 0, y: targetY, z: 0 },
    position: { x, y, z },
    distance,
    worldTop,
  };
}
