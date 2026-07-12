export function formatPercent(value: number): string {
  return `${(value * 100).toFixed(2)}%`;
}

export function formatForce(value: number): string {
  const abs = Math.abs(value);
  if (abs >= 1e9) {
    return `${(value / 1e9).toFixed(2)} GN`;
  }
  if (abs >= 1e6) {
    return `${(value / 1e6).toFixed(2)} MN`;
  }
  if (abs >= 1e3) {
    return `${(value / 1e3).toFixed(2)} kN`;
  }
  return `${value.toFixed(2)} N`;
}

export function formatPower(value: number): string {
  const abs = Math.abs(value);
  if (abs >= 1e9) {
    return `${(value / 1e9).toFixed(2)} GW`;
  }
  if (abs >= 1e6) {
    return `${(value / 1e6).toFixed(2)} MW`;
  }
  if (abs >= 1e3) {
    return `${(value / 1e3).toFixed(2)} kW`;
  }
  return `${value.toFixed(2)} W`;
}

export function formatMass(value: number): string {
  if (value >= 1_000_000) {
    return `${(value / 1_000_000).toFixed(2)} Mt`;
  }
  if (value >= 1_000) {
    return `${(value / 1_000).toFixed(2)} t`;
  }
  return `${value.toFixed(2)} kg`;
}

export function formatVelocity(value: number): string {
  return `${value.toFixed(2)} m/s`;
}

export function formatDistance(value: number): string {
  if (value >= 1000) {
    return `${(value / 1000).toFixed(2)} km`;
  }
  return `${value.toFixed(2)} m`;
}
