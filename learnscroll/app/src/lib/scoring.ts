import type { CardAttempt, LearningCard, TopicScore } from '../types/domain';

const DAY_MS = 24 * 60 * 60 * 1000;

const clamp = (value: number, minimum: number, maximum: number): number => {
  return Math.max(minimum, Math.min(maximum, value));
};

const scoreAttempt = (attempt: CardAttempt, nowMs: number): number => {
  const attemptMs = new Date(attempt.timestamp).getTime();
  const ageDays = Math.max(0, (nowMs - attemptMs) / DAY_MS);
  const recencyWeight = 1 / (1 + ageDays / 7);

  let base = -1;
  if (attempt.result === 'correct') {
    base = 1;
    if (attempt.latencyMs <= 5_000) {
      base += 0.2;
    }
  }

  return base * recencyWeight;
};

export const computeTopicScores = (
  cards: LearningCard[],
  attempts: CardAttempt[],
  nowIso: string
): TopicScore[] => {
  const nowMs = new Date(nowIso).getTime();
  const cardById = new Map<string, LearningCard>();
  const aggregate = new Map<string, { rawScore: number; attempts: number }>();

  for (const card of cards) {
    cardById.set(card.id, card);
  }

  for (const attempt of attempts) {
    const card = cardById.get(attempt.cardId);
    if (!card) {
      continue;
    }

    const contribution = scoreAttempt(attempt, nowMs);

    for (const tag of card.tags) {
      const current = aggregate.get(tag) ?? { rawScore: 0, attempts: 0 };
      current.rawScore += contribution;
      current.attempts += 1;
      aggregate.set(tag, current);
    }
  }

  const scores: TopicScore[] = [];
  for (const [tag, value] of aggregate.entries()) {
    const normalized = clamp(50 + value.rawScore * 10, 0, 100);
    scores.push({
      tag,
      score: Math.round(normalized),
      attempts: value.attempts
    });
  }

  scores.sort((left, right) => left.score - right.score || left.tag.localeCompare(right.tag));
  return scores;
};

export const pickWeakTopics = (topicScores: TopicScore[], limit: number): string[] => {
  return topicScores
    .filter(
      (topic) =>
        topic.attempts > 0 &&
        !topic.tag.startsWith('domain:') &&
        !topic.tag.startsWith('track:')
    )
    .slice(0, limit)
    .map((topic) => topic.tag);
};
