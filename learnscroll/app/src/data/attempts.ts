import { db } from './db';
import { buildReviewQueueItem } from '../lib/review';
import type { AttemptResult, CardAttempt } from '../types/domain';

const attemptId = (cardId: string, timestampIso: string): string => {
  return `${cardId}_${timestampIso}`;
};

export const recordAttempt = async (
  cardId: string,
  result: AttemptResult,
  latencyMs: number,
  timestampIso: string
): Promise<CardAttempt> => {
  const attempt: CardAttempt = {
    id: attemptId(cardId, timestampIso),
    cardId,
    result,
    latencyMs,
    timestamp: timestampIso
  };

  const reviewItem = buildReviewQueueItem(cardId, result, latencyMs, timestampIso);

  await db.transaction('rw', db.attempts, db.reviewQueue, async () => {
    await db.attempts.put(attempt);
    await db.reviewQueue.put(reviewItem);
  });

  return attempt;
};
