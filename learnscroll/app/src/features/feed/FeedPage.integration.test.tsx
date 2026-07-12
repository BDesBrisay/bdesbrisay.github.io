import { renderToStaticMarkup } from 'react-dom/server';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { db, resetDatabase } from '../../data/db';
import { useSessionStore } from '../../store/sessionStore';
import type { LearningCard } from '../../types/domain';
import { CardView } from '../../components/CardView';

const waitMs = (ms: number): Promise<void> =>
  new Promise((resolve) => {
    setTimeout(resolve, ms);
  });

const quickCard = (id: string, prompt: string, answer: string): LearningCard => ({
  id,
  packId: 'starter-math-v1',
  type: 'quick_math',
  prompt,
  options: [],
  answer,
  explanation: 'Solve the expression directly.',
  tags: ['math'],
  difficulty: 2
});

const conceptCard = (): LearningCard => ({
  id: 'science-card-1',
  packId: 'starter-science-v1',
  type: 'concept_check',
  prompt: 'Which Newton law describes inertia?',
  options: ['First law', 'Second law', 'Third law', 'Law of gravitation'],
  answer: 'First law',
  explanation: 'Inertia means velocity stays unchanged without net force.',
  optionExplanations: {
    'First law': 'Correct. It defines inertia for objects at rest or moving uniformly.',
    'Second law': 'Incorrect for inertia. It connects force to acceleration.',
    'Third law': 'Incorrect here. It describes action-reaction force pairs.',
    'Law of gravitation': 'Incorrect here. It models attraction between masses.'
  },
  tags: ['science'],
  difficulty: 3
});

const setReadyState = (
  cards: LearningCard[],
  overrides: Partial<ReturnType<typeof useSessionStore.getState>> = {}
): void => {
  const nowIso = new Date('2026-02-26T20:00:00.000Z').toISOString();

  useSessionStore.setState((state) => ({
    ...state,
    status: 'ready',
    cards,
    currentIndex: 0,
    sessionGoal: cards.length,
    sessionStartedAt: nowIso,
    currentCardStartedAt: nowIso,
    revealed: false,
    locked: false,
    selectedOption: null,
    results: [],
    summary: null,
    schedulerDiagnostics: null,
    errorMessage: null,
    online: true,
    autoAdvanceEnabled: true,
    autoAdvanceDelayMs: 1500,
    announcement: '',
    ...overrides
  }));
};

const installWindowTimers = (): void => {
  Object.defineProperty(globalThis, 'window', {
    configurable: true,
    value: globalThis
  });
};

describe('feed integration', () => {
  beforeEach(async () => {
    installWindowTimers();
    await resetDatabase();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('supports freeform reveal -> grade -> auto-advance', async () => {
    setReadyState([
      quickCard('math-1', 'Solve 8 + 4.', '12'),
      quickCard('math-2', 'Solve 9 + 3.', '12')
    ]);

    useSessionStore.getState().revealCurrentCard();
    await useSessionStore.getState().submitCurrentResult('correct', null);

    await waitMs(20);

    expect(useSessionStore.getState().currentIndex).toBe(1);
    expect(useSessionStore.getState().results).toHaveLength(1);
  });

  it('supports concept-check reveal rationale and delayed auto-advance', async () => {
    setReadyState([conceptCard(), quickCard('math-3', 'Solve 5 + 5.', '10')], {
      autoAdvanceEnabled: true,
      autoAdvanceDelayMs: 20
    });

    await useSessionStore.getState().answerConceptOption('First law');

    expect(useSessionStore.getState().revealed).toBe(true);
    expect(useSessionStore.getState().locked).toBe(true);
    expect(useSessionStore.getState().selectedOption).toBe('First law');

    await waitMs(5);
    expect(useSessionStore.getState().currentIndex).toBe(0);

    await waitMs(40);
    expect(useSessionStore.getState().currentIndex).toBe(1);
  });

  it('disables auto-advance immediately when the setting is off', async () => {
    setReadyState([
      quickCard('math-4', 'Solve 6 + 6.', '12'),
      quickCard('math-5', 'Solve 7 + 6.', '13')
    ]);

    await useSessionStore.getState().setAutoAdvanceSettings(false, 1500);
    useSessionStore.getState().revealCurrentCard();
    await useSessionStore.getState().submitCurrentResult('incorrect', null);

    await waitMs(40);

    expect(useSessionStore.getState().currentIndex).toBe(0);
    expect(useSessionStore.getState().locked).toBe(true);

    await useSessionStore.getState().goNext();
    expect(useSessionStore.getState().currentIndex).toBe(1);
  });

  it('prevents duplicate writes from rapid repeated concept-check taps', async () => {
    setReadyState([conceptCard()], {
      autoAdvanceEnabled: false
    });

    await Promise.all([
      useSessionStore.getState().answerConceptOption('First law'),
      useSessionStore.getState().answerConceptOption('First law')
    ]);

    expect(useSessionStore.getState().results).toHaveLength(1);
    expect(await db.attempts.count()).toBe(1);
  });

  it('renders option rationale content from local card data while offline', () => {
    const markup = renderToStaticMarkup(
      <CardView
        card={conceptCard()}
        revealed
        selectedOption={'Second law'}
        onSelectOption={() => undefined}
        onFreeformGrade={() => undefined}
        canGradeFreeform={false}
        disabled
      />
    );

    expect(markup.includes('Option-by-Option Rationale')).toBe(true);
    expect(markup.includes('First law')).toBe(true);
    expect(markup.includes('Correct. It defines inertia')).toBe(true);
  });
});
