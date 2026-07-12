interface FeedProgressProps {
  currentIndex: number;
  total: number;
  sessionGoal: number;
}

export const FeedProgress = ({ currentIndex, total, sessionGoal }: FeedProgressProps) => {
  const safeTotal = Math.max(total, 1);
  const progress = Math.round(((currentIndex + 1) / safeTotal) * 100);

  return (
    <header className="feed-progress" aria-label="Session progress">
      <div className="feed-progress__label">Learning Session</div>
      <div className="feed-progress__value">
        {Math.min(currentIndex + 1, total)}/{total} cards
      </div>
      <div className="feed-progress__bar" role="progressbar" aria-valuenow={progress} aria-valuemin={0} aria-valuemax={100}>
        <div className="feed-progress__bar-fill" style={{ width: `${progress}%` }} />
      </div>
      <div className="feed-progress__goal">Goal: {sessionGoal}</div>
    </header>
  );
};
