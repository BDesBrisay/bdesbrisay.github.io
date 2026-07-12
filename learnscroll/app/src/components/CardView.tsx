import { useEffect, useMemo, useState } from 'react';
import type { AttemptResult, LearningCard } from '../types/domain';

interface CardViewProps {
  card: LearningCard;
  revealed: boolean;
  selectedOption: string | null;
  onSelectOption: (option: string) => void;
  onFreeformGrade: (result: Extract<AttemptResult, 'correct' | 'incorrect'>) => void;
  canGradeFreeform: boolean;
  disabled: boolean;
}

export const CardView = ({
  card,
  revealed,
  selectedOption,
  onSelectOption,
  onFreeformGrade,
  canGradeFreeform,
  disabled
}: CardViewProps) => {
  const showOptionList = card.type === 'concept_check';
  const [rationaleExpanded, setRationaleExpanded] = useState(false);
  const rationaleEntries = useMemo(() => {
    if (!card.optionExplanations) {
      return [];
    }

    return card.options
      .filter((option) => Boolean(card.optionExplanations?.[option]))
      .map((option) => ({
        option,
        explanation: card.optionExplanations?.[option] ?? '',
        correct: option === card.answer
      }));
  }, [card.answer, card.optionExplanations, card.options]);

  useEffect(() => {
    setRationaleExpanded(false);
  }, [card.id]);

  const collapsedRationaleEntries =
    rationaleExpanded || rationaleEntries.length <= 2 ? rationaleEntries : rationaleEntries.slice(0, 2);
  const needsRationaleToggle = rationaleEntries.length > 2;

  return (
    <article className="card-view">
      <div className="card-view__meta">
        <span className="chip chip--type">{card.type.replace('_', ' ')}</span>
        <span className="chip chip--difficulty">difficulty {card.difficulty}</span>
      </div>

      <h1 className="card-view__prompt">{card.prompt}</h1>

      {showOptionList ? (
        <div className="card-view__options">
          {card.options.map((option) => {
            const isSelected = option === selectedOption;
            const isCorrect = option === card.answer;
            const optionClass =
              revealed && isCorrect
                ? 'option option--correct'
                : revealed && isSelected && !isCorrect
                  ? 'option option--incorrect'
                  : isSelected
                    ? 'option option--selected'
                    : 'option';

            return (
              <button
                key={option}
                type="button"
                className={optionClass}
                onClick={() => onSelectOption(option)}
                disabled={disabled || revealed}
              >
                {option}
              </button>
            );
          })}
        </div>
      ) : (
        <p className="card-view__hint">Think first, then reveal and self-grade.</p>
      )}

      {revealed ? (
        <section className="card-view__explanation" aria-live="polite">
          <h2>Answer</h2>
          <p className="card-view__answer">{card.answer}</p>
          <h3>Why it works</h3>
          <p>{card.explanation}</p>

          {showOptionList ? (
            rationaleEntries.length > 0 ? (
              <section className="card-view__rationale">
                <h3>Option-by-Option Rationale</h3>
                <ul className="card-view__rationale-list">
                  {collapsedRationaleEntries.map((entry) => (
                    <li
                      key={entry.option}
                      className={
                        entry.correct
                          ? 'card-view__rationale-item card-view__rationale-item--correct'
                          : 'card-view__rationale-item card-view__rationale-item--incorrect'
                      }
                    >
                      <p className="card-view__rationale-label">
                        {entry.option}
                        <span>{entry.correct ? 'correct' : 'incorrect'}</span>
                      </p>
                      <p className="card-view__rationale-text">{entry.explanation}</p>
                    </li>
                  ))}
                </ul>

                {needsRationaleToggle ? (
                  <button
                    type="button"
                    className="btn btn--secondary card-view__rationale-toggle"
                    onClick={() => {
                      setRationaleExpanded((expanded) => !expanded);
                    }}
                  >
                    {rationaleExpanded ? 'Show less rationale' : 'Show all rationale'}
                  </button>
                ) : null}
              </section>
            ) : (
              <section className="card-view__rationale card-view__rationale--fallback">
                <h3>Option rationale</h3>
                <p>
                  This card does not include per-option rationale yet. Correct answer: <strong>{card.answer}</strong>.
                </p>
              </section>
            )
          ) : null}

          {!showOptionList && canGradeFreeform ? (
            <section className="card-view__grading">
              <h3>How did you do?</h3>
              <div className="card-view__grading-actions">
                <button
                  type="button"
                  className="btn btn--success card-view__grade-button"
                  onClick={() => onFreeformGrade('correct')}
                  disabled={disabled}
                >
                  I got it
                </button>
                <button
                  type="button"
                  className="btn btn--danger card-view__grade-button"
                  onClick={() => onFreeformGrade('incorrect')}
                  disabled={disabled}
                >
                  Needs review
                </button>
              </div>
            </section>
          ) : null}
        </section>
      ) : null}

      <footer className="card-view__topics">
        {card.tags.map((tag) => (
          <span key={tag} className="chip chip--topic">
            {tag}
          </span>
        ))}
      </footer>
    </article>
  );
};
