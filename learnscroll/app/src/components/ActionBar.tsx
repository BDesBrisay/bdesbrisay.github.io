interface ActionBarProps {
  showReveal: boolean;
  showNext: boolean;
  canReveal: boolean;
  canNext: boolean;
  onReveal: () => void;
  onNext: () => void;
}

export const ActionBar = ({
  showReveal,
  showNext,
  canReveal,
  canNext,
  onReveal,
  onNext
}: ActionBarProps) => {
  if (!showReveal && !showNext) {
    return null;
  }

  return (
    <div className="action-bar">
      {showReveal ? (
        <button type="button" className="btn btn--secondary" onClick={onReveal} disabled={!canReveal}>
          Reveal
        </button>
      ) : null}

      {showNext ? (
        <button type="button" className="btn btn--primary" onClick={onNext} disabled={!canNext}>
          Next
        </button>
      ) : null}
    </div>
  );
};
