import { describe, expect, it } from 'vitest';
import { selectSessionCards } from './scheduler';
import type {
  CardAttempt,
  CurriculumDomain,
  DifficultyBucket,
  InstalledPack,
  LearningCard,
  ReviewQueueItem
} from '../types/domain';

const createPack = (id: string, domain: CurriculumDomain, track: string): InstalledPack => ({
  id,
  version: '1.0.0',
  title: id,
  topics: [track],
  installedAt: '2026-01-01T00:00:00.000Z',
  sourceUrl: `/content/packs/${id}.json`,
  domain,
  track,
  stage: 'core',
  recommendedOrder: 1
});

const createCard = (
  id: string,
  difficulty: number,
  options: {
    packId?: string;
    tags?: string[];
  } = {}
): LearningCard => ({
  id,
  packId: options.packId ?? 'math-arithmetic-v1',
  type: 'quick_math',
  prompt: `Card ${id}`,
  options: [],
  answer: '42',
  explanation: 'Reasoning.',
  tags: options.tags ?? ['domain:math', 'track:arithmetic', 'topic-a'],
  difficulty
});

const bucketFromDifficulty = (difficulty: number): DifficultyBucket => {
  if (difficulty <= 2) {
    return 'foundational';
  }

  if (difficulty === 3) {
    return 'intermediate';
  }

  return 'advanced';
};

const countBuckets = (cards: LearningCard[]): Record<DifficultyBucket, number> => {
  return cards.reduce<Record<DifficultyBucket, number>>(
    (counts, card) => {
      const bucket = bucketFromDifficulty(card.difficulty);
      counts[bucket] += 1;
      return counts;
    },
    {
      foundational: 0,
      intermediate: 0,
      advanced: 0
    }
  );
};

const createCardsForBucket = (
  bucket: DifficultyBucket,
  count: number,
  startIndex: number
): LearningCard[] => {
  const difficulty = bucket === 'foundational' ? 2 : bucket === 'intermediate' ? 3 : 5;
  return Array.from({ length: count }, (_value, offset) =>
    createCard(`${bucket}-${startIndex + offset}`, difficulty, {
      tags: ['domain:math', 'track:arithmetic', bucket]
    })
  );
};

const buildPerformanceAttempts = (
  cardIds: string[],
  correctCount: number,
  nowIso: string
): CardAttempt[] => {
  return cardIds.map((cardId, index) => {
    const timestamp = new Date(new Date(nowIso).getTime() - index * 60_000).toISOString();
    return {
      id: `attempt-${cardId}-${index}`,
      cardId,
      result: index < correctCount ? 'correct' : 'incorrect',
      latencyMs: 1200,
      timestamp
    };
  });
};

const longestAdvancedStreak = (cards: LearningCard[]): number => {
  let current = 0;
  let max = 0;

  for (const card of cards) {
    if (bucketFromDifficulty(card.difficulty) === 'advanced') {
      current += 1;
      max = Math.max(max, current);
      continue;
    }

    current = 0;
  }

  return max;
};

const defaultPacks: InstalledPack[] = [
  createPack('math-arithmetic-v1', 'math', 'arithmetic'),
  createPack('science-physics-v1', 'science', 'physics')
];

describe('session scheduler', () => {
  it('prioritizes due and unseen cards before recent correct cards', () => {
    const cards = [
      createCard('new-card', 1),
      createCard('due-card', 1),
      createCard('recent-correct', 1)
    ];

    const attempts: CardAttempt[] = [
      {
        id: 'attempt-1',
        cardId: 'recent-correct',
        result: 'correct',
        latencyMs: 1000,
        timestamp: '2026-01-02T00:00:00.000Z'
      }
    ];

    const reviewQueue: ReviewQueueItem[] = [
      {
        cardId: 'due-card',
        priority: 5,
        nextDueAt: '2026-01-01T00:00:00.000Z'
      }
    ];

    const selected = selectSessionCards({
      cards,
      attempts,
      reviewQueue,
      installedPacks: defaultPacks,
      sessionGoal: 2,
      nowIso: '2026-01-03T00:00:00.000Z',
      random: () => 0,
      filterMode: 'all-installed',
      sourceCardCount: cards.length,
      activeDomains: [],
      activeTracks: [],
      activePackIds: [],
      dailyCurriculumMode: 'guided'
    });

    const selectedIds = selected.cards.map((card) => card.id);

    expect(selectedIds).toContain('due-card');
    expect(selectedIds).toContain('new-card');
    expect(selectedIds).not.toContain('recent-correct');
  });

  it('enforces baseline target counts for session difficulty mix', () => {
    const cards = [
      ...createCardsForBucket('foundational', 12, 1),
      ...createCardsForBucket('intermediate', 12, 1),
      ...createCardsForBucket('advanced', 12, 1)
    ];

    const selected = selectSessionCards({
      cards,
      attempts: [],
      reviewQueue: [],
      installedPacks: defaultPacks,
      sessionGoal: 20,
      nowIso: '2026-01-03T00:00:00.000Z',
      random: () => 0.31,
      filterMode: 'all-installed',
      sourceCardCount: cards.length,
      activeDomains: [],
      activeTracks: [],
      activePackIds: [],
      dailyCurriculumMode: 'guided'
    });

    const counts = countBuckets(selected.cards);

    expect(selected.diagnostics.targetCounts).toEqual({
      foundational: 8,
      intermediate: 7,
      advanced: 5
    });
    expect(counts).toEqual({
      foundational: 8,
      intermediate: 7,
      advanced: 5
    });
  });

  it('uses active curriculum context for adaptation window accuracy', () => {
    const mathCards = createCardsForBucket('intermediate', 20, 1).map((card) => ({
      ...card,
      packId: 'math-arithmetic-v1',
      tags: ['domain:math', 'track:arithmetic', 'topic-math']
    }));
    const scienceCards = createCardsForBucket('intermediate', 20, 50).map((card) => ({
      ...card,
      packId: 'science-physics-v1',
      tags: ['domain:science', 'track:physics', 'topic-science']
    }));
    const cards = [...mathCards, ...scienceCards];

    const mathAttempts = buildPerformanceAttempts(
      mathCards.slice(0, 20).map((card) => card.id),
      18,
      '2026-01-03T00:00:00.000Z'
    );
    const scienceAttempts = buildPerformanceAttempts(
      scienceCards.slice(0, 20).map((card) => card.id),
      4,
      '2026-01-03T00:00:00.000Z'
    );

    const selected = selectSessionCards({
      cards,
      attempts: [...scienceAttempts, ...mathAttempts],
      reviewQueue: [],
      installedPacks: defaultPacks,
      sessionGoal: 20,
      nowIso: '2026-01-03T00:00:00.000Z',
      random: () => 0.22,
      filterMode: 'active-domains-tracks',
      sourceCardCount: cards.length,
      activeDomains: ['math'],
      activeTracks: [],
      activePackIds: [],
      dailyCurriculumMode: 'guided'
    });

    expect(selected.diagnostics.performanceAccuracy).not.toBeNull();
    expect((selected.diagnostics.performanceAccuracy ?? 0) > 0.8).toBe(true);
    expect(selected.diagnostics.targetMix).toEqual({
      foundational: 0.3,
      intermediate: 0.4,
      advanced: 0.3
    });
    expect(selected.diagnostics.filterMode).toBe('active-domains-tracks');
  });

  it('adds scaffold hints when active-context performance drops below 55%', () => {
    const cards = [
      ...createCardsForBucket('foundational', 15, 1),
      ...createCardsForBucket('intermediate', 15, 1),
      ...createCardsForBucket('advanced', 15, 1)
    ];

    const attempts = buildPerformanceAttempts(
      cards.slice(0, 30).map((card) => card.id),
      12,
      '2026-01-03T00:00:00.000Z'
    );

    const selected = selectSessionCards({
      cards,
      attempts,
      reviewQueue: [],
      installedPacks: defaultPacks,
      sessionGoal: 20,
      nowIso: '2026-01-03T00:00:00.000Z',
      random: () => 0.45,
      filterMode: 'all-installed',
      sourceCardCount: cards.length,
      activeDomains: [],
      activeTracks: [],
      activePackIds: [],
      dailyCurriculumMode: 'guided'
    });

    expect(selected.diagnostics.targetMix).toEqual({
      foundational: 0.55,
      intermediate: 0.3,
      advanced: 0.15
    });
    expect(selected.diagnostics.scaffoldTagHints.length).toBeGreaterThan(0);
  });

  it('prevents long advanced streaks when enough easier cards are available', () => {
    const cards = [
      ...createCardsForBucket('advanced', 10, 1),
      ...createCardsForBucket('intermediate', 10, 1),
      ...createCardsForBucket('foundational', 10, 1)
    ];

    const selected = selectSessionCards({
      cards,
      attempts: [],
      reviewQueue: [],
      installedPacks: defaultPacks,
      sessionGoal: 18,
      nowIso: '2026-01-03T00:00:00.000Z',
      random: () => 0.05,
      filterMode: 'all-installed',
      sourceCardCount: cards.length,
      activeDomains: [],
      activeTracks: [],
      activePackIds: [],
      dailyCurriculumMode: 'guided'
    });

    expect(longestAdvancedStreak(selected.cards)).toBeLessThanOrEqual(2);
  });

  it('tracks blend targets and achieved counts in diagnostics', () => {
    const cards = [
      createCard('due-1', 2),
      createCard('due-2', 2),
      createCard('active-1', 3),
      createCard('active-2', 3),
      createCard('active-3', 3),
      createCard('active-4', 3),
      createCard('active-5', 3),
      createCard('active-6', 3),
      createCard('active-7', 3),
      createCard('active-8', 3)
    ];
    const reviewQueue: ReviewQueueItem[] = [
      { cardId: 'due-1', priority: 5, nextDueAt: '2026-01-01T00:00:00.000Z' },
      { cardId: 'due-2', priority: 4, nextDueAt: '2026-01-01T00:00:00.000Z' }
    ];

    const selected = selectSessionCards({
      cards,
      attempts: [],
      reviewQueue,
      installedPacks: defaultPacks,
      sessionGoal: 8,
      nowIso: '2026-01-03T00:00:00.000Z',
      random: () => 0.21,
      filterMode: 'active-domains-tracks',
      sourceCardCount: cards.length,
      activeDomains: ['math'],
      activeTracks: ['arithmetic'],
      activePackIds: [],
      dailyCurriculumMode: 'guided'
    });

    expect(selected.diagnostics.blendTargets.activeTrack).toBeGreaterThan(0);
    expect(selected.diagnostics.blendTargets.dueReview).toBeGreaterThan(0);
    expect(selected.diagnostics.blendAchieved.activeTrack).toBeGreaterThan(0);
    expect(selected.diagnostics.blendAchieved.dueReview).toBeGreaterThan(0);
  });
});
