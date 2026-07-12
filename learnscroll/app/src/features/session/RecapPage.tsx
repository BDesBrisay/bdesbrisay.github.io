import { useNavigate } from 'react-router-dom';
import { useSessionStore } from '../../store/sessionStore';

const formatDuration = (durationMs: number): string => {
  const totalSeconds = Math.round(durationMs / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes}m ${seconds}s`;
};

export const RecapPage = () => {
  const navigate = useNavigate();
  const { summary, startSession } = useSessionStore();

  if (!summary) {
    return <section className="center-panel">Complete a session to see recap details.</section>;
  }

  return (
    <section className="recap-page">
      <h1>Session Recap</h1>
      <div className="recap-grid">
        <div className="recap-tile">
          <h2>Accuracy</h2>
          <p>{summary.accuracy}%</p>
        </div>
        <div className="recap-tile">
          <h2>Correct</h2>
          <p>
            {summary.correctCards}/{summary.completedCards}
          </p>
        </div>
        <div className="recap-tile">
          <h2>Streak</h2>
          <p>{summary.streak} days</p>
        </div>
        <div className="recap-tile">
          <h2>Duration</h2>
          <p>{formatDuration(summary.durationMs)}</p>
        </div>
      </div>

      <section className="recap-weak-topics">
        <h2>Weak Topics by Domain</h2>
        {summary.weakTopics.length === 0 ? (
          <p>No weak topics detected yet.</p>
        ) : (
          Object.entries(summary.weakTopicsByDomain).map(([domain, topics]) => (
            <div key={domain} className="recap-weak-topics__domain">
              <h3>{domain}</h3>
              <ul>
                {topics.map((topic) => (
                  <li key={`${domain}-${topic}`}>{topic}</li>
                ))}
              </ul>
            </div>
          ))
        )}
      </section>

      <button
        type="button"
        className="btn btn--primary"
        onClick={async () => {
          await startSession();
          navigate('/feed');
        }}
      >
        Start Next Session
      </button>
    </section>
  );
};
