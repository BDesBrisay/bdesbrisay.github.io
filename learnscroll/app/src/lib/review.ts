import type { AttemptResult, ReviewQueueItem } from '../types/domain';

const MINUTE_MS = 60 * 1000;
const HOUR_MS = 60 * MINUTE_MS;
const DAY_MS = 24 * HOUR_MS;

const toIso = (timestampMs: number): string => {
  return new Date(timestampMs).toISOString();
};

export const getReviewIntervalMs = (result: AttemptResult, latencyMs: number): number => {
  if (result === 'incorrect' || result === 'revealed') {
    return 10 * MINUTE_MS;
  }

  if (latencyMs <= 5_000) {
    return DAY_MS;
  }

  return 8 * HOUR_MS;
};

export const getReviewPriority = (result: AttemptResult, latencyMs: number): number => {
  if (result === 'incorrect') {
    return 5;
  }

  if (result === 'revealed') {
    return 4;
  }

  if (latencyMs <= 5_000) {
    return 2;
  }

  return 3;
};

export const buildReviewQueueItem = (
  cardId: string,
  result: AttemptResult,
  latencyMs: number,
  timestamp: string
): ReviewQueueItem => {
  const baseTimeMs = new Date(timestamp).getTime();
  const intervalMs = getReviewIntervalMs(result, latencyMs);

  return {
    cardId,
    priority: getReviewPriority(result, latencyMs),
    nextDueAt: toIso(baseTimeMs + intervalMs)
  };
};
