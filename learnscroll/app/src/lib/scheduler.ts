import type {
  CardAttempt,
  CurriculumDomain,
  DailyCurriculumMode,
  DifficultyBucket,
  DifficultyMix,
  InstalledPack,
  LearningCard,
  ReviewQueueItem,
  SessionBlendCounts,
  SessionFilterMode,
  SessionSelectionDiagnostics
} from '../types/domain';

export interface SessionSelectionInput {
  cards: LearningCard[];
  attempts: CardAttempt[];
  reviewQueue: ReviewQueueItem[];
  installedPacks: InstalledPack[];
  sessionGoal: number;
  nowIso: string;
  random: () => number;
  filterMode: SessionFilterMode;
  sourceCardCount: number;
  activeDomains: CurriculumDomain[];
  activeTracks: string[];
  activePackIds: string[];
  dailyCurriculumMode: DailyCurriculumMode;
}

export interface SessionSelectionResult {
  cards: LearningCard[];
  diagnostics: SessionSelectionDiagnostics;
}

interface CardSignal {
  duePriority: number;
  isUnseen: boolean;
  recentCorrect: boolean;
  recentIncorrect: boolean;
}

interface BlendTargetRatios {
  activeTrack: number;
  dueReview: number;
  weakTopic: number;
}

const HOUR_MS = 60 * 60 * 1000;
const ADVANCED_STREAK_LIMIT = 2;

const BASELINE_MIX: DifficultyMix = {
  foundational: 0.4,
  intermediate: 0.35,
  advanced: 0.25
};

const HIGH_ACCURACY_MIX: DifficultyMix = {
  foundational: 0.3,
  intermediate: 0.4,
  advanced: 0.3
};

const LOW_ACCURACY_MIX: DifficultyMix = {
  foundational: 0.55,
  intermediate: 0.3,
  advanced: 0.15
};

const GUIDED_BLEND_TARGETS: BlendTargetRatios = {
  activeTrack: 0.65,
  dueReview: 0.25,
  weakTopic: 0.1
};

const MIXED_BLEND_TARGETS: BlendTargetRatios = {
  activeTrack: 0.6,
  dueReview: 0.3,
  weakTopic: 0.1
};

const emptyMixCounts = (): DifficultyMix => ({
  foundational: 0,
  intermediate: 0,
  advanced: 0
});

const emptyBlendCounts = (): SessionBlendCounts => ({
  activeTrack: 0,
  dueReview: 0,
  weakTopic: 0
});

const bucketForDifficulty = (difficulty: number): DifficultyBucket => {
  if (difficulty <= 2) {
    return 'foundational';
  }

  if (difficulty === 3) {
    return 'intermediate';
  }

  return 'advanced';
};

const buildLatestAttemptMap = (attempts: CardAttempt[]): Map<string, CardAttempt> => {
  const latestAttemptByCardId = new Map<string, CardAttempt>();
  for (const attempt of attempts) {
    const existing = latestAttemptByCardId.get(attempt.cardId);
    if (!existing) {
      latestAttemptByCardId.set(attempt.cardId, attempt);
      continue;
    }

    if (new Date(attempt.timestamp).getTime() > new Date(existing.timestamp).getTime()) {
      latestAttemptByCardId.set(attempt.cardId, attempt);
    }
  }

  return latestAttemptByCardId;
};

const buildDuePriorityMap = (reviewQueue: ReviewQueueItem[], nowIso: string): Map<string, number> => {
  const nowMs = new Date(nowIso).getTime();
  const dueMap = new Map<string, number>();

  for (const item of reviewQueue) {
    if (new Date(item.nextDueAt).getTime() <= nowMs) {
      dueMap.set(item.cardId, item.priority);
    }
  }

  return dueMap;
};

const getCardSignal = (
  card: LearningCard,
  latestAttemptByCardId: Map<string, CardAttempt>,
  duePriorityByCardId: Map<string, number>,
  nowIso: string
): CardSignal => {
  const latestAttempt = latestAttemptByCardId.get(card.id);
  const duePriority = duePriorityByCardId.get(card.id) ?? 0;

  if (!latestAttempt) {
    return {
      duePriority,
      isUnseen: true,
      recentCorrect: false,
      recentIncorrect: false
    };
  }

  const nowMs = new Date(nowIso).getTime();
  const attemptMs = new Date(latestAttempt.timestamp).getTime();
  const recent = nowMs - attemptMs <= 24 * HOUR_MS;

  return {
    duePriority,
    isUnseen: false,
    recentCorrect: recent && latestAttempt.result === 'correct',
    recentIncorrect: recent && latestAttempt.result !== 'correct'
  };
};

const getCardWeight = (signal: CardSignal): number => {
  if (signal.duePriority > 0) {
    return 7 + signal.duePriority;
  }

  if (signal.isUnseen) {
    return 8;
  }

  if (signal.recentIncorrect) {
    return 6;
  }

  if (signal.recentCorrect) {
    return 1;
  }

  return 3;
};

const weightedPick = (
  pool: Array<{ card: LearningCard; weight: number }>,
  random: () => number
): LearningCard => {
  const totalWeight = pool.reduce((sum, item) => sum + item.weight, 0);
  const target = random() * totalWeight;

  let cumulative = 0;
  for (const item of pool) {
    cumulative += item.weight;
    if (target <= cumulative) {
      return item.card;
    }
  }

  return pool[pool.length - 1].card;
};

const topicPenalty = (card: LearningCard, selectedTopicCount: Map<string, number>): number => {
  let penalty = 0;
  for (const tag of card.tags) {
    const count = selectedTopicCount.get(tag) ?? 0;
    penalty += count * 0.45;
  }
  return penalty;
};

const toMixCounts = (count: number, mix: DifficultyMix): DifficultyMix => {
  const weighted = {
    foundational: mix.foundational * count,
    intermediate: mix.intermediate * count,
    advanced: mix.advanced * count
  };

  const counts: DifficultyMix = {
    foundational: Math.floor(weighted.foundational),
    intermediate: Math.floor(weighted.intermediate),
    advanced: Math.floor(weighted.advanced)
  };

  const remainders: Array<{ bucket: DifficultyBucket; remainder: number }> = [
    { bucket: 'foundational', remainder: weighted.foundational - counts.foundational },
    { bucket: 'intermediate', remainder: weighted.intermediate - counts.intermediate },
    { bucket: 'advanced', remainder: weighted.advanced - counts.advanced }
  ];

  let remaining = count - (counts.foundational + counts.intermediate + counts.advanced);
  remainders.sort((left, right) => right.remainder - left.remainder);

  for (const item of remainders) {
    if (remaining <= 0) {
      break;
    }

    counts[item.bucket] += 1;
    remaining -= 1;
  }

  return counts;
};

const mixFromCounts = (counts: DifficultyMix, total: number): DifficultyMix => {
  if (total <= 0) {
    return emptyMixCounts();
  }

  return {
    foundational: Number((counts.foundational / total).toFixed(2)),
    intermediate: Number((counts.intermediate / total).toFixed(2)),
    advanced: Number((counts.advanced / total).toFixed(2))
  };
};

const hasBucketCandidates = (cards: LearningCard[], bucket: DifficultyBucket): boolean => {
  return cards.some((card) => bucketForDifficulty(card.difficulty) === bucket);
};

const getAdvancedStreakLength = (selectedCards: LearningCard[]): number => {
  let streak = 0;

  for (let index = selectedCards.length - 1; index >= 0; index -= 1) {
    if (bucketForDifficulty(selectedCards[index].difficulty) !== 'advanced') {
      break;
    }
    streak += 1;
  }

  return streak;
};

const clampMix = (mix: DifficultyMix): DifficultyMix => {
  const total = mix.foundational + mix.intermediate + mix.advanced;
  if (total <= 0) {
    return BASELINE_MIX;
  }

  return {
    foundational: mix.foundational / total,
    intermediate: mix.intermediate / total,
    advanced: mix.advanced / total
  };
};

const selectTargetMix = (accuracy: number | null): DifficultyMix => {
  if (accuracy === null) {
    return BASELINE_MIX;
  }

  if (accuracy > 0.8) {
    return HIGH_ACCURACY_MIX;
  }

  if (accuracy < 0.55) {
    return LOW_ACCURACY_MIX;
  }

  return BASELINE_MIX;
};

const computeAccuracy = (attempts: CardAttempt[]): number | null => {
  if (attempts.length === 0) {
    return null;
  }

  const correct = attempts.filter((attempt) => attempt.result === 'correct').length;
  return correct / attempts.length;
};

const buildPackById = (installedPacks: InstalledPack[]): Map<string, InstalledPack> => {
  return new Map(installedPacks.map((pack) => [pack.id, pack]));
};

const matchesActiveContext = (
  card: LearningCard,
  packById: Map<string, InstalledPack>,
  activeDomains: CurriculumDomain[],
  activeTracks: string[],
  activePackIds: string[]
): boolean => {
  const activePackSet = new Set(activePackIds);
  if (activePackSet.size > 0) {
    return activePackSet.has(card.packId);
  }

  const pack = packById.get(card.packId);
  const activeTrackSet = new Set(activeTracks);
  const activeDomainSet = new Set(activeDomains);

  if (activeTrackSet.size > 0) {
    if (!pack?.track || !activeTrackSet.has(pack.track)) {
      return false;
    }

    if (activeDomainSet.size > 0) {
      return Boolean(pack.domain && activeDomainSet.has(pack.domain));
    }

    return true;
  }

  if (activeDomainSet.size > 0) {
    return Boolean(pack?.domain && activeDomainSet.has(pack.domain));
  }

  return true;
};

const buildPerformanceWindow = (
  attempts: CardAttempt[],
  cardById: Map<string, LearningCard>,
  isActiveCard: (card: LearningCard) => boolean
): CardAttempt[] => {
  return [...attempts]
    .sort((left, right) => new Date(right.timestamp).getTime() - new Date(left.timestamp).getTime())
    .filter((attempt) => {
      const card = cardById.get(attempt.cardId);
      return Boolean(card && isActiveCard(card));
    })
    .slice(0, 30);
};

const buildScaffoldTagHints = (
  performanceWindow: CardAttempt[],
  cardById: Map<string, LearningCard>,
  accuracy: number | null
): string[] => {
  if (accuracy === null || accuracy >= 0.55) {
    return [];
  }

  const tagSet = new Set<string>();

  for (const attempt of performanceWindow) {
    if (attempt.result === 'correct') {
      continue;
    }

    const card = cardById.get(attempt.cardId);
    if (!card) {
      continue;
    }

    for (const tag of card.tags) {
      tagSet.add(tag);
      if (tagSet.size >= 8) {
        return [...tagSet];
      }
    }
  }

  return [...tagSet];
};

const chooseTargetBucket = (
  targetCounts: DifficultyMix,
  selectedCounts: DifficultyMix,
  remainingCards: LearningCard[],
  selectedCards: LearningCard[]
): DifficultyBucket | null => {
  const deficits: Array<{ bucket: DifficultyBucket; deficit: number }> = [
    { bucket: 'foundational', deficit: targetCounts.foundational - selectedCounts.foundational },
    { bucket: 'intermediate', deficit: targetCounts.intermediate - selectedCounts.intermediate },
    { bucket: 'advanced', deficit: targetCounts.advanced - selectedCounts.advanced }
  ];

  deficits.sort((left, right) => right.deficit - left.deficit);

  const advancedStreak = getAdvancedStreakLength(selectedCards);

  for (const item of deficits) {
    if (item.deficit <= 0) {
      continue;
    }

    if (!hasBucketCandidates(remainingCards, item.bucket)) {
      continue;
    }

    if (item.bucket === 'advanced' && advancedStreak >= ADVANCED_STREAK_LIMIT) {
      continue;
    }

    return item.bucket;
  }

  if (advancedStreak >= ADVANCED_STREAK_LIMIT) {
    for (const bucket of ['foundational', 'intermediate'] as const) {
      if (hasBucketCandidates(remainingCards, bucket)) {
        return bucket;
      }
    }
  }

  return null;
};

const toBlendTargets = (targetCount: number, mode: DailyCurriculumMode): SessionBlendCounts => {
  const ratios = mode === 'guided' ? GUIDED_BLEND_TARGETS : MIXED_BLEND_TARGETS;
  return {
    activeTrack: Math.round(targetCount * ratios.activeTrack),
    dueReview: Math.round(targetCount * ratios.dueReview),
    weakTopic: Math.round(targetCount * ratios.weakTopic)
  };
};

const blendBoostForCard = (
  selectedBlend: SessionBlendCounts,
  blendTargets: SessionBlendCounts,
  isActiveCard: boolean,
  isDueCard: boolean,
  isWeakTopicCard: boolean,
  mode: DailyCurriculumMode,
  duePriority: number
): number => {
  const activeDeficit = blendTargets.activeTrack - selectedBlend.activeTrack;
  const dueDeficit = blendTargets.dueReview - selectedBlend.dueReview;
  const weakDeficit = blendTargets.weakTopic - selectedBlend.weakTopic;

  let boost = 0;
  const activeBoost = mode === 'guided' ? 1.35 : 1.0;

  if (isActiveCard && activeDeficit > 0) {
    boost += activeBoost;
  }
  if (!isActiveCard && activeDeficit > 0) {
    boost -= 0.35;
  }

  if (isDueCard && dueDeficit > 0) {
    boost += 1.2 + Math.min(1.2, duePriority * 0.15);
  }

  if (isWeakTopicCard && weakDeficit > 0) {
    boost += 0.9;
  }

  return boost;
};

const includeInBlendCounts = (
  blend: SessionBlendCounts,
  isActiveCard: boolean,
  isDueCard: boolean,
  isWeakTopicCard: boolean
): void => {
  if (isActiveCard) {
    blend.activeTrack += 1;
  }
  if (isDueCard) {
    blend.dueReview += 1;
  }
  if (isWeakTopicCard) {
    blend.weakTopic += 1;
  }
};

const buildDiagnostics = (
  selectedCards: LearningCard[],
  baselineMix: DifficultyMix,
  targetMix: DifficultyMix,
  targetCounts: DifficultyMix,
  performanceWindowSize: number,
  performanceAccuracy: number | null,
  scaffoldTagHints: string[],
  blendTargets: SessionBlendCounts,
  blendAchieved: SessionBlendCounts,
  filterMode: SessionFilterMode,
  sourceCardCount: number,
  filteredCardCount: number,
  activeDomains: CurriculumDomain[],
  activeTracks: string[],
  activePackIds: string[]
): SessionSelectionDiagnostics => {
  const achievedCounts = selectedCards.reduce<DifficultyMix>((accumulator, card) => {
    const bucket = bucketForDifficulty(card.difficulty);
    accumulator[bucket] += 1;
    return accumulator;
  }, emptyMixCounts());

  return {
    filterMode,
    sourceCardCount,
    filteredCardCount,
    activeDomains,
    activeTracks,
    activePackIds,
    baselineMix,
    targetMix,
    targetCounts,
    achievedCounts,
    achievedMix: mixFromCounts(achievedCounts, selectedCards.length),
    performanceWindowSize,
    performanceAccuracy,
    scaffoldTagHints,
    blendTargets,
    blendAchieved
  };
};

export const selectSessionCards = ({
  cards,
  attempts,
  reviewQueue,
  installedPacks,
  sessionGoal,
  nowIso,
  random,
  filterMode,
  sourceCardCount,
  activeDomains,
  activeTracks,
  activePackIds,
  dailyCurriculumMode
}: SessionSelectionInput): SessionSelectionResult => {
  const latestAttemptByCardId = buildLatestAttemptMap(attempts);
  const duePriorityByCardId = buildDuePriorityMap(reviewQueue, nowIso);
  const cardById = new Map(cards.map((card) => [card.id, card]));
  const packById = buildPackById(installedPacks);
  const matchesContext = (card: LearningCard): boolean =>
    matchesActiveContext(card, packById, activeDomains, activeTracks, activePackIds);
  const performanceWindow = buildPerformanceWindow(attempts, cardById, matchesContext);
  const performanceAccuracy = computeAccuracy(performanceWindow);
  const targetMix = clampMix(selectTargetMix(performanceAccuracy));
  const targetCount = Math.min(sessionGoal, cards.length);
  const targetCounts = toMixCounts(targetCount, targetMix);
  const scaffoldTagHints = buildScaffoldTagHints(performanceWindow, cardById, performanceAccuracy);
  const scaffoldTagSet = new Set(scaffoldTagHints);
  const blendTargets = toBlendTargets(targetCount, dailyCurriculumMode);

  const includeCard = (
    blend: SessionBlendCounts,
    card: LearningCard,
    signal: CardSignal
  ): void => {
    includeInBlendCounts(
      blend,
      matchesContext(card),
      signal.duePriority > 0,
      scaffoldTagSet.size > 0 && card.tags.some((tag) => scaffoldTagSet.has(tag))
    );
  };

  if (cards.length <= sessionGoal) {
    const blendAchieved = emptyBlendCounts();
    for (const card of cards) {
      const signal = getCardSignal(card, latestAttemptByCardId, duePriorityByCardId, nowIso);
      includeCard(blendAchieved, card, signal);
    }

    return {
      cards: [...cards],
      diagnostics: buildDiagnostics(
        cards,
        BASELINE_MIX,
        targetMix,
        targetCounts,
        performanceWindow.length,
        performanceAccuracy,
        scaffoldTagHints,
        blendTargets,
        blendAchieved,
        filterMode,
        sourceCardCount,
        cards.length,
        activeDomains,
        activeTracks,
        activePackIds
      )
    };
  }

  const selectedCards: LearningCard[] = [];
  const selectedTopicCount = new Map<string, number>();
  const selectedCounts = emptyMixCounts();
  const selectedBlend = emptyBlendCounts();
  const remainingCards = [...cards];

  while (selectedCards.length < sessionGoal && remainingCards.length > 0) {
    const targetBucket = chooseTargetBucket(targetCounts, selectedCounts, remainingCards, selectedCards);

    const candidates =
      targetBucket === null
        ? remainingCards
        : remainingCards.filter((card) => bucketForDifficulty(card.difficulty) === targetBucket);

    const weightedPool = candidates.map((card) => {
      const signal = getCardSignal(card, latestAttemptByCardId, duePriorityByCardId, nowIso);
      const baseWeight = getCardWeight(signal);
      const penalty = topicPenalty(card, selectedTopicCount);
      const active = matchesContext(card);
      const weakTopic = scaffoldTagSet.size > 0 && card.tags.some((tag) => scaffoldTagSet.has(tag));
      const blendBoost = blendBoostForCard(
        selectedBlend,
        blendTargets,
        active,
        signal.duePriority > 0,
        weakTopic,
        dailyCurriculumMode,
        signal.duePriority
      );

      const adjustedWeight = Math.max(0.5, baseWeight + blendBoost - penalty);
      return { card, weight: adjustedWeight };
    });

    const picked = weightedPick(weightedPool, random);
    selectedCards.push(picked);

    const bucket = bucketForDifficulty(picked.difficulty);
    selectedCounts[bucket] += 1;

    const pickedSignal = getCardSignal(picked, latestAttemptByCardId, duePriorityByCardId, nowIso);
    includeCard(selectedBlend, picked, pickedSignal);

    for (const tag of picked.tags) {
      selectedTopicCount.set(tag, (selectedTopicCount.get(tag) ?? 0) + 1);
    }

    const pickedIndex = remainingCards.findIndex((card) => card.id === picked.id);
    if (pickedIndex >= 0) {
      remainingCards.splice(pickedIndex, 1);
    }
  }

  return {
    cards: selectedCards,
    diagnostics: buildDiagnostics(
      selectedCards,
      BASELINE_MIX,
      targetMix,
      targetCounts,
      performanceWindow.length,
      performanceAccuracy,
      scaffoldTagHints,
      blendTargets,
      selectedBlend,
      filterMode,
      sourceCardCount,
      cards.length,
      activeDomains,
      activeTracks,
      activePackIds
    )
  };
};
