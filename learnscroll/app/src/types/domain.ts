export type CardType = 'quick_math' | 'concept_check' | 'flash_fact';

export type AttemptResult = 'correct' | 'incorrect' | 'revealed';

export type DifficultyBucket = 'foundational' | 'intermediate' | 'advanced';

export type CurriculumDomain = 'math' | 'science' | 'computer-science';

export type CurriculumStage = 'foundation' | 'core' | 'advanced';

export type DailyCurriculumMode = 'guided' | 'mixed';

export type SessionFilterMode = 'active-packs' | 'active-domains-tracks' | 'all-installed';

export type OptionExplanations = Record<string, string>;

export interface LearningCard {
  id: string;
  packId: string;
  type: CardType;
  prompt: string;
  options: string[];
  answer: string;
  explanation: string;
  optionExplanations?: OptionExplanations;
  autoAdvanceMs?: number;
  tags: string[];
  difficulty: number;
}

export interface PackCurriculumMetadata {
  domain?: CurriculumDomain;
  track?: string;
  stage?: CurriculumStage;
  recommendedOrder?: number;
  prerequisites?: string[];
}

export interface ContentPackData extends PackCurriculumMetadata {
  packId: string;
  version: string;
  title: string;
  topics: string[];
  createdAt: string;
  cards: LearningCard[];
}

export interface PackManifestEntry extends PackCurriculumMetadata {
  packId: string;
  version: string;
  title: string;
  topics: string[];
  url: string;
  defaultInstall: boolean;
}

export interface PackManifest {
  generatedAt: string;
  packs: PackManifestEntry[];
}

export interface InstalledPack extends PackCurriculumMetadata {
  id: string;
  version: string;
  title: string;
  topics: string[];
  installedAt: string;
  sourceUrl: string;
}

export interface CardAttempt {
  id: string;
  cardId: string;
  result: AttemptResult;
  latencyMs: number;
  timestamp: string;
}

export interface ReviewQueueItem {
  cardId: string;
  priority: number;
  nextDueAt: string;
}

export interface Profile {
  id: 'profile';
  streak: number;
  sessionGoal: number;
  autoAdvanceEnabled: boolean;
  autoAdvanceDelayMs: number;
  activeDomains: CurriculumDomain[];
  activeTracks: string[];
  activePackIds: string[];
  dailyCurriculumMode: DailyCurriculumMode;
  lastSessionDate: string | null;
  updatedAt: string;
}

export interface SessionSummary {
  completedCards: number;
  correctCards: number;
  accuracy: number;
  streak: number;
  weakTopics: string[];
  weakTopicsByDomain: Record<string, string[]>;
  durationMs: number;
}

export interface TopicScore {
  tag: string;
  score: number;
  attempts: number;
}

export interface SessionCardResult {
  cardId: string;
  result: AttemptResult;
  latencyMs: number;
  selectedOption: string | null;
}

export interface DifficultyMix {
  foundational: number;
  intermediate: number;
  advanced: number;
}

export interface SessionBlendCounts {
  activeTrack: number;
  dueReview: number;
  weakTopic: number;
}

export interface SessionSelectionDiagnostics {
  filterMode: SessionFilterMode;
  sourceCardCount: number;
  filteredCardCount: number;
  activeDomains: CurriculumDomain[];
  activeTracks: string[];
  activePackIds: string[];
  baselineMix: DifficultyMix;
  targetMix: DifficultyMix;
  targetCounts: DifficultyMix;
  achievedCounts: DifficultyMix;
  achievedMix: DifficultyMix;
  performanceWindowSize: number;
  performanceAccuracy: number | null;
  scaffoldTagHints: string[];
  blendTargets: SessionBlendCounts;
  blendAchieved: SessionBlendCounts;
}
