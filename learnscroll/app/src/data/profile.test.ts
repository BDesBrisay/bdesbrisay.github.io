import { beforeEach, describe, expect, it } from 'vitest';
import { db, resetDatabase } from './db';
import {
  ensureProfile,
  updateActivePackIds,
  updateCurriculumPreferences
} from './profile';

describe('profile data', () => {
  beforeEach(async () => {
    await resetDatabase();
  });

  it('creates default curriculum fields for a new profile', async () => {
    const profile = await ensureProfile();

    expect(profile.dailyCurriculumMode).toBe('guided');
    expect(profile.activeDomains).toEqual([]);
    expect(profile.activeTracks).toEqual([]);
    expect(profile.activePackIds).toEqual([]);
  });

  it('normalizes curriculum preference input', async () => {
    const updated = await updateCurriculumPreferences({
      activeDomains: ['math', 'science', 'science', 'invalid-domain'],
      activeTracks: ['geometry', 'geometry', ' calculus ', ''],
      dailyCurriculumMode: 'mixed'
    });

    expect(updated.activeDomains).toEqual(['math', 'science']);
    expect(updated.activeTracks).toEqual(['calculus', 'geometry']);
    expect(updated.dailyCurriculumMode).toBe('mixed');
  });

  it('normalizes active pack focus IDs and persists values', async () => {
    await ensureProfile();

    const updated = await updateActivePackIds([
      'math-geometry-v1',
      'math-geometry-v1',
      'science-physics-v1',
      '  '
    ]);
    const stored = await db.profile.get('profile');

    expect(updated.activePackIds).toEqual(['math-geometry-v1', 'science-physics-v1']);
    expect(stored?.activePackIds).toEqual(['math-geometry-v1', 'science-physics-v1']);
  });
});
