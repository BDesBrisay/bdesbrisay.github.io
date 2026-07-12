import { beforeEach, describe, expect, it } from 'vitest';
import { db, resetDatabase } from './db';
import { recordAttempt } from './attempts';

describe('review queue integration', () => {
  beforeEach(async () => {
    await resetDatabase();

    await db.cards.put({
      id: 'card-1',
      packId: 'pack-a',
      type: 'quick_math',
      prompt: '1+1?',
      options: [],
      answer: '2',
      explanation: 'Addition',
      tags: ['math'],
      difficulty: 1
    });
  });

  it('writes attempts and schedules review', async () => {
    const timestamp = '2026-01-01T00:00:00.000Z';
    await recordAttempt('card-1', 'incorrect', 8_000, timestamp);

    const attempts = await db.attempts.toArray();
    const reviewItems = await db.reviewQueue.toArray();

    expect(attempts).toHaveLength(1);
    expect(reviewItems).toHaveLength(1);
    expect(reviewItems[0]?.priority).toBe(5);
    expect(reviewItems[0]?.nextDueAt).toBe('2026-01-01T00:10:00.000Z');
  });
});
