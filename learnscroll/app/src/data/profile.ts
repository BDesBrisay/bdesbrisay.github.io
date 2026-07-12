import { db } from './db';
import type {
  CurriculumDomain,
  DailyCurriculumMode,
  Profile
} from '../types/domain';

const PROFILE_ID: Profile['id'] = 'profile';
export const DEFAULT_SESSION_GOAL = 10;
export const DEFAULT_AUTO_ADVANCE_ENABLED = true;
export const DEFAULT_AUTO_ADVANCE_DELAY_MS = 1500;
export const MIN_AUTO_ADVANCE_DELAY_MS = 1200;
export const MAX_AUTO_ADVANCE_DELAY_MS = 1800;
export const DEFAULT_DAILY_CURRICULUM_MODE: DailyCurriculumMode = 'guided';

const CURRICULUM_DOMAINS: CurriculumDomain[] = ['math', 'science', 'computer-science'];
const DAILY_MODES: DailyCurriculumMode[] = ['guided', 'mixed'];

const todayString = (nowIso: string): string => {
  return nowIso.slice(0, 10);
};

const isCurriculumDomain = (value: string): value is CurriculumDomain => {
  return CURRICULUM_DOMAINS.includes(value as CurriculumDomain);
};

const isDailyMode = (value: string): value is DailyCurriculumMode => {
  return DAILY_MODES.includes(value as DailyCurriculumMode);
};

const normalizeStringList = (values: string[]): string[] => {
  const normalized = values
    .map((value) => value.trim())
    .filter((value) => value.length > 0);
  return [...new Set(normalized)].sort((left, right) => left.localeCompare(right));
};

const normalizeActiveDomains = (domains: string[]): CurriculumDomain[] => {
  return normalizeStringList(domains).filter(isCurriculumDomain);
};

const normalizeDailyMode = (mode: string): DailyCurriculumMode => {
  return isDailyMode(mode) ? mode : DEFAULT_DAILY_CURRICULUM_MODE;
};

export const clampAutoAdvanceDelayMs = (value: number): number => {
  if (!Number.isFinite(value)) {
    return DEFAULT_AUTO_ADVANCE_DELAY_MS;
  }

  return Math.max(
    MIN_AUTO_ADVANCE_DELAY_MS,
    Math.min(MAX_AUTO_ADVANCE_DELAY_MS, Math.round(value))
  );
};

const dayDifference = (leftIsoDate: string, rightIsoDate: string): number => {
  const left = new Date(`${leftIsoDate}T00:00:00.000Z`).getTime();
  const right = new Date(`${rightIsoDate}T00:00:00.000Z`).getTime();
  const dayMs = 24 * 60 * 60 * 1000;
  return Math.round((left - right) / dayMs);
};

const withProfileDefaults = (profile: Profile): Profile => {
  return {
    ...profile,
    sessionGoal: Math.max(5, Math.min(40, Math.round(profile.sessionGoal))),
    autoAdvanceEnabled: profile.autoAdvanceEnabled ?? DEFAULT_AUTO_ADVANCE_ENABLED,
    autoAdvanceDelayMs: clampAutoAdvanceDelayMs(
      profile.autoAdvanceDelayMs ?? DEFAULT_AUTO_ADVANCE_DELAY_MS
    ),
    activeDomains: normalizeActiveDomains(profile.activeDomains ?? []),
    activeTracks: normalizeStringList(profile.activeTracks ?? []),
    activePackIds: normalizeStringList(profile.activePackIds ?? []),
    dailyCurriculumMode: normalizeDailyMode(
      profile.dailyCurriculumMode ?? DEFAULT_DAILY_CURRICULUM_MODE
    )
  };
};

export const ensureProfile = async (): Promise<Profile> => {
  const existing = await db.profile.get(PROFILE_ID);

  if (existing) {
    const normalized = withProfileDefaults(existing);
    if (
      normalized.sessionGoal !== existing.sessionGoal ||
      normalized.autoAdvanceEnabled !== existing.autoAdvanceEnabled ||
      normalized.autoAdvanceDelayMs !== existing.autoAdvanceDelayMs ||
      normalized.dailyCurriculumMode !== existing.dailyCurriculumMode ||
      normalized.activeDomains.join('|') !== (existing.activeDomains ?? []).join('|') ||
      normalized.activeTracks.join('|') !== (existing.activeTracks ?? []).join('|') ||
      normalized.activePackIds.join('|') !== (existing.activePackIds ?? []).join('|')
    ) {
      const patched: Profile = {
        ...normalized,
        updatedAt: new Date().toISOString()
      };
      await db.profile.put(patched);
      return patched;
    }

    return normalized;
  }

  const nowIso = new Date().toISOString();
  const profile: Profile = {
    id: PROFILE_ID,
    streak: 0,
    sessionGoal: DEFAULT_SESSION_GOAL,
    autoAdvanceEnabled: DEFAULT_AUTO_ADVANCE_ENABLED,
    autoAdvanceDelayMs: DEFAULT_AUTO_ADVANCE_DELAY_MS,
    activeDomains: [],
    activeTracks: [],
    activePackIds: [],
    dailyCurriculumMode: DEFAULT_DAILY_CURRICULUM_MODE,
    lastSessionDate: null,
    updatedAt: nowIso
  };

  await db.profile.put(profile);
  return profile;
};

export const updateSessionGoal = async (sessionGoal: number): Promise<Profile> => {
  const profile = await ensureProfile();
  const nextProfile: Profile = {
    ...profile,
    sessionGoal: Math.max(5, Math.min(40, Math.round(sessionGoal))),
    updatedAt: new Date().toISOString()
  };

  await db.profile.put(nextProfile);
  return nextProfile;
};

export const updateAutoAdvanceSettings = async (
  autoAdvanceEnabled: boolean,
  autoAdvanceDelayMs: number
): Promise<Profile> => {
  const profile = await ensureProfile();
  const nextProfile: Profile = {
    ...profile,
    autoAdvanceEnabled,
    autoAdvanceDelayMs: clampAutoAdvanceDelayMs(autoAdvanceDelayMs),
    updatedAt: new Date().toISOString()
  };

  await db.profile.put(nextProfile);
  return nextProfile;
};

export interface CurriculumPreferencesInput {
  activeDomains: string[];
  activeTracks: string[];
  dailyCurriculumMode: string;
}

export const updateCurriculumPreferences = async (
  preferences: CurriculumPreferencesInput
): Promise<Profile> => {
  const profile = await ensureProfile();
  const nextProfile: Profile = {
    ...profile,
    activeDomains: normalizeActiveDomains(preferences.activeDomains),
    activeTracks: normalizeStringList(preferences.activeTracks),
    dailyCurriculumMode: normalizeDailyMode(preferences.dailyCurriculumMode),
    updatedAt: new Date().toISOString()
  };

  await db.profile.put(nextProfile);
  return nextProfile;
};

export const updateActivePackIds = async (activePackIds: string[]): Promise<Profile> => {
  const profile = await ensureProfile();
  const nextProfile: Profile = {
    ...profile,
    activePackIds: normalizeStringList(activePackIds),
    updatedAt: new Date().toISOString()
  };

  await db.profile.put(nextProfile);
  return nextProfile;
};

export const updateStreakAfterSession = async (nowIso: string): Promise<Profile> => {
  const profile = await ensureProfile();
  const today = todayString(nowIso);

  let nextStreak = profile.streak;

  if (!profile.lastSessionDate) {
    nextStreak = 1;
  } else {
    const diff = dayDifference(today, profile.lastSessionDate);
    if (diff === 0) {
      nextStreak = profile.streak;
    } else if (diff === 1) {
      nextStreak = profile.streak + 1;
    } else {
      nextStreak = 1;
    }
  }

  const updated: Profile = {
    ...profile,
    streak: nextStreak,
    lastSessionDate: today,
    updatedAt: nowIso
  };

  await db.profile.put(updated);
  return updated;
};
