import { describe, expect, it } from 'vitest';
import { compareVersions, isVersionNewer } from './version';

describe('version comparison', () => {
  it('compares semantic versions correctly', () => {
    expect(compareVersions('1.0.0', '1.0.1')).toBeLessThan(0);
    expect(compareVersions('1.1.0', '1.0.9')).toBeGreaterThan(0);
    expect(compareVersions('2.0.0', '2.0.0')).toBe(0);
  });

  it('identifies when a version is newer', () => {
    expect(isVersionNewer('1.2.3', '1.3.0')).toBe(true);
    expect(isVersionNewer('2.0.0', '1.9.9')).toBe(false);
  });
});
