import { create } from 'zustand';
import { db } from '../data/db';
import { recordAttempt } from '../data/attempts';
import {
  clampAutoAdvanceDelayMs,
  updateActivePackIds,
  updateAutoAdvanceSettings,
  updateCurriculumPreferences,
  updateSessionGoal,
  updateStreakAfterSession,
  ensureProfile
} from '../data/profile';
import { ensureSeededData } from '../data/seed';
import { selectSessionCards } from '../lib/scheduler';
import { computeTopicScores, pickWeakTopics } from '../lib/scoring';
import type {
  AttemptResult,
  CurriculumDomain,
  DailyCurriculumMode,
  LearningCard,
  Profile,
  SessionCardResult,
  SessionFilterMode,
  SessionSelectionDiagnostics,
  SessionSummary
} from '../types/domain';

export type SessionStatus = 'idle' | 'loading' | 'ready' | 'complete' | 'error';

interface SessionState {
  status: SessionStatus;
  cards: LearningCard[];
  currentIndex: number;
  sessionGoal: number;
  sessionStartedAt: string | null;
  currentCardStartedAt: string | null;
  revealed: boolean;
  locked: boolean;
  selectedOption: string | null;
  results: SessionCardResult[];
  streak: number;
  summary: SessionSummary | null;
  schedulerDiagnostics: SessionSelectionDiagnostics | null;
  errorMessage: string | null;
  online: boolean;
  updateAvailable: boolean;
  autoAdvanceEnabled: boolean;
  autoAdvanceDelayMs: number;
  activeDomains: CurriculumDomain[];
  activeTracks: string[];
  activePackIds: string[];
  dailyCurriculumMode: DailyCurriculumMode;
  sessionFilterMode: SessionFilterMode;
  curriculumContextLabel: string;
  announcement: string;
  bootstrap: () => Promise<void>;
  startSession: () => Promise<void>;
  setSessionGoal: (value: number) => Promise<void>;
  setAutoAdvanceSettings: (enabled: boolean, delayMs: number) => Promise<void>;
  setCurriculumPreferences: (
    activeDomains: string[],
    activeTracks: string[],
    dailyCurriculumMode: string
  ) => Promise<void>;
  setActivePackFocus: (activePackIds: string[]) => Promise<void>;
  revealCurrentCard: () => void;
  submitCurrentResult: (result: AttemptResult, selectedOption: string | null) => Promise<void>;
  answerConceptOption: (selectedOption: string) => Promise<void>;
  goNext: () => Promise<void>;
  refreshOnlineState: (online: boolean) => void;
  setUpdateAvailable: (value: boolean) => void;
}

let autoAdvanceTimer: number | null = null;

const clearAutoAdvanceTimer = (): void => {
  if (typeof window === 'undefined') {
    autoAdvanceTimer = null;
    return;
  }

  if (autoAdvanceTimer !== null) {
    window.clearTimeout(autoAdvanceTimer);
    autoAdvanceTimer = null;
  }
};

const nowIso = (): string => new Date().toISOString();

const roundAccuracy = (correctCards: number, totalCards: number): number => {
  if (totalCards === 0) {
    return 0;
  }

  return Math.round((correctCards / totalCards) * 100);
};

const completedResults = (results: SessionCardResult[]): SessionCardResult[] => {
  return results.filter((result) => result.result === 'correct' || result.result === 'incorrect');
};

const normalizeLabel = (value: string): string => {
  return value
    .split('-')
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ');
};

const buildCurriculumContextLabel = (
  profile: Pick<Profile, 'activePackIds' | 'activeTracks' | 'activeDomains' | 'dailyCurriculumMode'>
): string => {
  if (profile.activePackIds.length > 0) {
    return `Focused packs: ${profile.activePackIds.length}`;
  }

  if (profile.activeTracks.length > 0) {
    const labels = profile.activeTracks.slice(0, 2).map(normalizeLabel).join(', ');
    const suffix = profile.activeTracks.length > 2 ? ' +' : '';
    return `Tracks: ${labels}${suffix}`;
  }

  if (profile.activeDomains.length > 0) {
    return `Domains: ${profile.activeDomains.map(normalizeLabel).join(', ')}`;
  }

  return profile.dailyCurriculumMode === 'guided'
    ? 'Guided mode: all installed packs'
    : 'Mixed mode: all installed packs';
};

const groupWeakTopicsByDomain = (
  weakTopics: string[],
  cards: LearningCard[]
): Record<string, string[]> => {
  const grouped: Record<string, string[]> = {};

  for (const weakTopic of weakTopics) {
    const matchingCard = cards.find((card) => card.tags.includes(weakTopic));
    const domainTag = matchingCard?.tags.find((tag) => tag.startsWith('domain:'));
    const domain = domainTag ? domainTag.slice('domain:'.length) : 'other';

    if (!grouped[domain]) {
      grouped[domain] = [];
    }

    grouped[domain].push(weakTopic);
  }

  return grouped;
};

const buildCardPool = (
  allCards: LearningCard[],
  profile: Pick<Profile, 'activePackIds' | 'activeDomains' | 'activeTracks'>,
  installedPackMetadataById: Map<string, { domain?: CurriculumDomain; track?: string }>
): { cards: LearningCard[]; filterMode: SessionFilterMode } => {
  if (profile.activePackIds.length > 0) {
    const activePackIdSet = new Set(profile.activePackIds);
    const cards = allCards.filter((card) => activePackIdSet.has(card.packId));
    if (cards.length > 0) {
      return { cards, filterMode: 'active-packs' };
    }
  }

  if (profile.activeDomains.length > 0 || profile.activeTracks.length > 0) {
    const activeDomainSet = new Set(profile.activeDomains);
    const activeTrackSet = new Set(profile.activeTracks);

    const cards = allCards.filter((card) => {
      const pack = installedPackMetadataById.get(card.packId);
      if (!pack) {
        return false;
      }

      if (activeTrackSet.size > 0) {
        if (!pack.track || !activeTrackSet.has(pack.track)) {
          return false;
        }
      }

      if (activeDomainSet.size > 0) {
        if (!pack.domain || !activeDomainSet.has(pack.domain)) {
          return false;
        }
      }

      return true;
    });

    if (cards.length > 0) {
      return { cards, filterMode: 'active-domains-tracks' };
    }
  }

  return { cards: [...allCards], filterMode: 'all-installed' };
};

export const useSessionStore = create<SessionState>((set, get) => ({
  status: 'idle',
  cards: [],
  currentIndex: 0,
  sessionGoal: 10,
  sessionStartedAt: null,
  currentCardStartedAt: null,
  revealed: false,
  locked: false,
  selectedOption: null,
  results: [],
  streak: 0,
  summary: null,
  schedulerDiagnostics: null,
  errorMessage: null,
  online: typeof navigator === 'undefined' ? true : navigator.onLine,
  updateAvailable: false,
  autoAdvanceEnabled: true,
  autoAdvanceDelayMs: 1500,
  activeDomains: [],
  activeTracks: [],
  activePackIds: [],
  dailyCurriculumMode: 'guided',
  sessionFilterMode: 'all-installed',
  curriculumContextLabel: 'Guided mode: all installed packs',
  announcement: '',

  bootstrap: async () => {
    const state = get();
    if (state.status !== 'idle') {
      return;
    }

    set({ status: 'loading', errorMessage: null });

    try {
      await ensureSeededData();
      const profile = await ensureProfile();
      set({
        sessionGoal: profile.sessionGoal,
        streak: profile.streak,
        autoAdvanceEnabled: profile.autoAdvanceEnabled,
        autoAdvanceDelayMs: profile.autoAdvanceDelayMs,
        activeDomains: profile.activeDomains,
        activeTracks: profile.activeTracks,
        activePackIds: profile.activePackIds,
        dailyCurriculumMode: profile.dailyCurriculumMode,
        curriculumContextLabel: buildCurriculumContextLabel(profile)
      });
      await get().startSession();
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unable to bootstrap session.';
      set({ status: 'error', errorMessage: message });
    }
  },

  startSession: async () => {
    clearAutoAdvanceTimer();
    set({ status: 'loading', errorMessage: null, summary: null, announcement: '' });

    try {
      const profile = await ensureProfile();
      const [cards, attempts, reviewQueue, installedPacks] = await Promise.all([
        db.cards.toArray(),
        db.attempts.toArray(),
        db.reviewQueue.toArray(),
        db.contentPacks.toArray()
      ]);

      const installedPackMetadataById = new Map(
        installedPacks.map((pack) => [pack.id, { domain: pack.domain, track: pack.track }])
      );

      const pool = buildCardPool(cards, profile, installedPackMetadataById);
      const now = nowIso();

      const selection = selectSessionCards({
        cards: pool.cards,
        attempts,
        reviewQueue,
        installedPacks,
        sessionGoal: profile.sessionGoal,
        nowIso: now,
        random: Math.random,
        filterMode: pool.filterMode,
        sourceCardCount: cards.length,
        activeDomains: profile.activeDomains,
        activeTracks: profile.activeTracks,
        activePackIds: profile.activePackIds,
        dailyCurriculumMode: profile.dailyCurriculumMode
      });

      set({
        status: 'ready',
        cards: selection.cards,
        currentIndex: 0,
        sessionGoal: profile.sessionGoal,
        sessionStartedAt: now,
        currentCardStartedAt: now,
        revealed: false,
        locked: false,
        selectedOption: null,
        results: [],
        errorMessage: null,
        streak: profile.streak,
        autoAdvanceEnabled: profile.autoAdvanceEnabled,
        autoAdvanceDelayMs: profile.autoAdvanceDelayMs,
        activeDomains: profile.activeDomains,
        activeTracks: profile.activeTracks,
        activePackIds: profile.activePackIds,
        dailyCurriculumMode: profile.dailyCurriculumMode,
        sessionFilterMode: pool.filterMode,
        curriculumContextLabel: buildCurriculumContextLabel(profile),
        schedulerDiagnostics: selection.diagnostics,
        announcement: ''
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unable to start session.';
      set({ status: 'error', errorMessage: message });
    }
  },

  setSessionGoal: async (value: number) => {
    const nextGoal = Math.max(5, Math.min(40, Math.round(value)));
    const profile = await updateSessionGoal(nextGoal);
    set({ sessionGoal: profile.sessionGoal });
  },

  setAutoAdvanceSettings: async (enabled: boolean, delayMs: number) => {
    const safeDelay = clampAutoAdvanceDelayMs(delayMs);
    const profile = await updateAutoAdvanceSettings(enabled, safeDelay);

    if (!enabled) {
      clearAutoAdvanceTimer();
    }

    set({
      autoAdvanceEnabled: profile.autoAdvanceEnabled,
      autoAdvanceDelayMs: profile.autoAdvanceDelayMs,
      announcement: profile.autoAdvanceEnabled
        ? `Auto-advance enabled at ${profile.autoAdvanceDelayMs} milliseconds.`
        : 'Auto-advance disabled.'
    });
  },

  setCurriculumPreferences: async (activeDomains: string[], activeTracks: string[], dailyMode: string) => {
    const profile = await updateCurriculumPreferences({
      activeDomains,
      activeTracks,
      dailyCurriculumMode: dailyMode
    });

    set({
      activeDomains: profile.activeDomains,
      activeTracks: profile.activeTracks,
      dailyCurriculumMode: profile.dailyCurriculumMode,
      curriculumContextLabel: buildCurriculumContextLabel(profile),
      announcement: `Curriculum preferences saved in ${profile.dailyCurriculumMode} mode.`
    });
  },

  setActivePackFocus: async (activePackIds: string[]) => {
    const profile = await updateActivePackIds(activePackIds);
    set({
      activePackIds: profile.activePackIds,
      curriculumContextLabel: buildCurriculumContextLabel(profile),
      announcement:
        profile.activePackIds.length > 0
          ? `Focused on ${profile.activePackIds.length} selected pack(s).`
          : 'Pack focus cleared. Using domain and track preferences.'
    });
  },

  revealCurrentCard: () => {
    const state = get();
    if (state.status !== 'ready' || state.revealed || state.locked) {
      return;
    }

    const currentCard = state.cards[state.currentIndex];
    if (!currentCard || currentCard.type === 'concept_check') {
      return;
    }

    set({
      revealed: true,
      announcement: 'Answer revealed. Choose I got it or Needs review to continue.'
    });
  },

  submitCurrentResult: async (result: AttemptResult, selectedOption: string | null) => {
    const state = get();
    if (state.status !== 'ready' || state.locked) {
      return;
    }

    const currentCard = state.cards[state.currentIndex];
    if (!currentCard) {
      return;
    }

    if (currentCard.type !== 'concept_check' && !state.revealed) {
      return;
    }

    const startedAt = state.currentCardStartedAt ?? nowIso();
    const timestamp = nowIso();
    const latencyMs = Math.max(100, new Date(timestamp).getTime() - new Date(startedAt).getTime());

    set({
      revealed: true,
      locked: true,
      selectedOption,
      announcement:
        result === 'correct'
          ? 'Marked correct. Moving to the next card.'
          : 'Marked needs review. Moving to the next card.'
    });

    try {
      await recordAttempt(currentCard.id, result, latencyMs, timestamp);

      const nextResults = [
        ...get().results,
        {
          cardId: currentCard.id,
          result,
          latencyMs,
          selectedOption
        }
      ];

      set({ results: nextResults });

      const latestState = get();
      if (!latestState.autoAdvanceEnabled || typeof window === 'undefined') {
        return;
      }

      const delayMs =
        currentCard.type === 'concept_check'
          ? currentCard.autoAdvanceMs ?? latestState.autoAdvanceDelayMs
          : 0;

      clearAutoAdvanceTimer();
      autoAdvanceTimer = window.setTimeout(() => {
        const currentState = get();
        const activeCard = currentState.cards[currentState.currentIndex];

        if (
          currentState.status !== 'ready' ||
          !activeCard ||
          !currentState.locked ||
          activeCard.id !== currentCard.id
        ) {
          return;
        }

        void currentState.goNext();
      }, Math.max(0, delayMs));
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unable to save your result.';
      set({
        locked: false,
        errorMessage: message,
        announcement: 'We could not save that result. Please try again.'
      });
    }
  },

  answerConceptOption: async (selectedOption: string) => {
    const state = get();
    if (state.status !== 'ready' || state.locked) {
      return;
    }

    const currentCard = state.cards[state.currentIndex];
    if (!currentCard || currentCard.type !== 'concept_check') {
      return;
    }

    const result: AttemptResult = selectedOption === currentCard.answer ? 'correct' : 'incorrect';
    await get().submitCurrentResult(result, selectedOption);
  },

  goNext: async () => {
    clearAutoAdvanceTimer();

    const state = get();
    if (state.status !== 'ready') {
      return;
    }

    const currentCard = state.cards[state.currentIndex];
    if (!currentCard || !state.locked) {
      return;
    }

    const nextIndex = state.currentIndex + 1;

    if (nextIndex < state.cards.length) {
      set({
        currentIndex: nextIndex,
        currentCardStartedAt: nowIso(),
        revealed: false,
        locked: false,
        selectedOption: null,
        announcement: ''
      });
      return;
    }

    const sessionEndedAt = nowIso();
    const finalResults = completedResults(state.results);
    const correctCards = finalResults.filter((result) => result.result === 'correct').length;
    const accuracy = roundAccuracy(correctCards, finalResults.length);

    const streakProfile = await updateStreakAfterSession(sessionEndedAt);

    const attempts = await db.attempts.toArray();
    const topicScores = computeTopicScores(state.cards, attempts, sessionEndedAt);
    const weakTopics = pickWeakTopics(topicScores, 3);
    const weakTopicsByDomain = groupWeakTopicsByDomain(weakTopics, state.cards);

    const durationMs = state.sessionStartedAt
      ? Math.max(0, new Date(sessionEndedAt).getTime() - new Date(state.sessionStartedAt).getTime())
      : 0;

    const summary: SessionSummary = {
      completedCards: finalResults.length,
      correctCards,
      accuracy,
      streak: streakProfile.streak,
      weakTopics,
      weakTopicsByDomain,
      durationMs
    };

    set({
      status: 'complete',
      summary,
      streak: streakProfile.streak,
      currentCardStartedAt: null,
      announcement: 'Session complete. Opening recap.'
    });
  },

  refreshOnlineState: (online: boolean) => {
    set({ online });
  },

  setUpdateAvailable: (value: boolean) => {
    set({ updateAvailable: value });
  }
}));
