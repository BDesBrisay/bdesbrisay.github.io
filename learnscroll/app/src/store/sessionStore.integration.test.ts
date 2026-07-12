import { beforeEach, describe, expect, it } from 'vitest';
import { db, resetDatabase } from '../data/db';
import { useSessionStore } from './sessionStore';
import type { LearningCard, Profile } from '../types/domain';

const mathCard: LearningCard = {
  id: 'math_arithmetic_qm_001',
  packId: 'math-arithmetic-v1',
  type: 'quick_math',
  prompt: '2 + 2',
  options: [],
  answer: '4',
  explanation: 'Simple arithmetic.',
  tags: ['domain:math', 'track:arithmetic'],
  difficulty: 1
};

const scienceCard: LearningCard = {
  id: 'science_physics_ff_001',
  packId: 'science-physics-v1',
  type: 'flash_fact',
  prompt: 'Unit of force',
  options: [],
  answer: 'newton',
  explanation: 'Force is measured in newtons.',
  tags: ['domain:science', 'track:physics'],
  difficulty: 1
};

const profileTemplate: Profile = {
  id: 'profile',
  streak: 0,
  sessionGoal: 10,
  autoAdvanceEnabled: true,
  autoAdvanceDelayMs: 1500,
  activeDomains: [],
  activeTracks: [],
  activePackIds: [],
  dailyCurriculumMode: 'guided',
  lastSessionDate: null,
  updatedAt: '2026-02-01T00:00:00.000Z'
};

describe('session store integration', () => {
  beforeEach(async () => {
    await resetDatabase();

    useSessionStore.setState((state) => ({
      ...state,
      status: 'idle',
      cards: [],
      currentIndex: 0,
      summary: null,
      schedulerDiagnostics: null,
      errorMessage: null
    }));

    await db.contentPacks.bulkPut([
      {
        id: 'math-arithmetic-v1',
        version: '1.0.0',
        title: 'Math Arithmetic',
        topics: ['arithmetic'],
        installedAt: '2026-02-01T00:00:00.000Z',
        sourceUrl: '/content/packs/math-arithmetic-v1.json',
        domain: 'math',
        track: 'arithmetic',
        stage: 'foundation',
        recommendedOrder: 1
      },
      {
        id: 'science-physics-v1',
        version: '1.0.0',
        title: 'Science Physics',
        topics: ['physics'],
        installedAt: '2026-02-01T00:00:00.000Z',
        sourceUrl: '/content/packs/science-physics-v1.json',
        domain: 'science',
        track: 'physics',
        stage: 'foundation',
        recommendedOrder: 1
      }
    ]);

    await db.cards.bulkPut([mathCard, scienceCard]);
  });

  it('filters session cards by active domains and tracks', async () => {
    await db.profile.put({
      ...profileTemplate,
      activeDomains: ['science'],
      activeTracks: ['physics']
    });

    await useSessionStore.getState().startSession();
    const state = useSessionStore.getState();

    expect(state.status).toBe('ready');
    expect(state.cards.every((card) => card.packId === 'science-physics-v1')).toBe(true);
    expect(state.sessionFilterMode).toBe('active-domains-tracks');
  });

  it('prioritizes explicit active pack focus over domain and track filters', async () => {
    await db.profile.put({
      ...profileTemplate,
      activeDomains: ['science'],
      activeTracks: ['physics'],
      activePackIds: ['math-arithmetic-v1']
    });

    await useSessionStore.getState().startSession();
    const state = useSessionStore.getState();

    expect(state.status).toBe('ready');
    expect(state.cards.every((card) => card.packId === 'math-arithmetic-v1')).toBe(true);
    expect(state.sessionFilterMode).toBe('active-packs');
  });
});
