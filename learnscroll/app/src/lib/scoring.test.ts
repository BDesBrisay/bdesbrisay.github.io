import { describe, expect, it } from 'vitest';
import { computeTopicScores, pickWeakTopics } from './scoring';
import type { CardAttempt, LearningCard } from '../types/domain';

const cards: LearningCard[] = [
  {
    id: 'a',
    packId: 'pack',
    type: 'quick_math',
    prompt: 'A',
    options: [],
    answer: '1',
    explanation: 'A',
    tags: ['math'],
    difficulty: 1
  },
  {
    id: 'b',
    packId: 'pack',
    type: 'quick_math',
    prompt: 'B',
    options: [],
    answer: '1',
    explanation: 'B',
    tags: ['science'],
    difficulty: 1
  }
];

const attempts: CardAttempt[] = [
  {
    id: '1',
    cardId: 'a',
    result: 'incorrect',
    latencyMs: 6_000,
    timestamp: '2026-01-01T00:00:00.000Z'
  },
  {
    id: '2',
    cardId: 'b',
    result: 'correct',
    latencyMs: 2_000,
    timestamp: '2026-01-01T00:00:00.000Z'
  }
];

describe('topic scoring', () => {
  it('scores topics with lower value for weaker performance', () => {
    const scores = computeTopicScores(cards, attempts, '2026-01-01T01:00:00.000Z');
    expect(scores[0]?.tag).toBe('math');
    expect(scores[1]?.tag).toBe('science');
    expect(scores[0]?.score).toBeLessThan(scores[1]?.score ?? 0);
  });

  it('returns weak topics in ascending confidence', () => {
    const scores = computeTopicScores(cards, attempts, '2026-01-01T01:00:00.000Z');
    expect(pickWeakTopics(scores, 1)).toEqual(['math']);
  });
});
