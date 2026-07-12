import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ActionBar } from '../../components/ActionBar';
import { CardView } from '../../components/CardView';
import { FeedProgress } from '../../components/FeedProgress';
import { SwipePane } from '../../components/SwipePane';
import { useSessionStore } from '../../store/sessionStore';

export const FeedPage = () => {
  const navigate = useNavigate();

  const {
    status,
    cards,
    currentIndex,
    sessionGoal,
    revealed,
    locked,
    selectedOption,
    errorMessage,
    bootstrap,
    revealCurrentCard,
    submitCurrentResult,
    answerConceptOption,
    goNext,
    refreshOnlineState,
    online,
    autoAdvanceEnabled,
    announcement,
    curriculumContextLabel,
    sessionFilterMode
  } = useSessionStore();

  const currentCard = cards[currentIndex];

  useEffect(() => {
    void bootstrap();
  }, [bootstrap]);

  useEffect(() => {
    const onOnline = (): void => refreshOnlineState(true);
    const onOffline = (): void => refreshOnlineState(false);

    window.addEventListener('online', onOnline);
    window.addEventListener('offline', onOffline);

    return () => {
      window.removeEventListener('online', onOnline);
      window.removeEventListener('offline', onOffline);
    };
  }, [refreshOnlineState]);

  useEffect(() => {
    if (status === 'complete') {
      navigate('/recap');
    }
  }, [navigate, status]);

  if (status === 'loading' || status === 'idle') {
    return <section className="center-panel">Loading your feed...</section>;
  }

  if (status === 'error') {
    return <section className="center-panel">{errorMessage ?? 'Something went wrong.'}</section>;
  }

  if (!currentCard) {
    return <section className="center-panel">No cards available.</section>;
  }

  const showReveal = currentCard.type !== 'concept_check' && !revealed;
  const canReveal = showReveal;
  const showNext = !autoAdvanceEnabled && revealed;
  const canNext = revealed && locked;

  const handleSwipeUp = (): void => {
    if (showNext && canNext) {
      void goNext();
    }
  };

  return (
    <section className="feed-page">
      <FeedProgress currentIndex={currentIndex} total={cards.length} sessionGoal={sessionGoal} />
      <div className="feed-page__connectivity">{online ? 'online' : 'offline mode'}</div>
      <div className="feed-page__curriculum">
        <span>{curriculumContextLabel}</span>
        <span>Pool: {sessionFilterMode}</span>
      </div>
      <p className="sr-only" role="status" aria-live="polite">
        {announcement}
      </p>
      <SwipePane onSwipeUp={handleSwipeUp} onSwipeDown={() => undefined}>
        <AnimatePresence mode="wait">
          <motion.div
            key={currentCard.id}
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -24 }}
            transition={{ duration: 0.2 }}
          >
            <CardView
              card={currentCard}
              revealed={revealed}
              selectedOption={selectedOption}
              onSelectOption={(option) => {
                void answerConceptOption(option);
              }}
              onFreeformGrade={(result) => {
                void submitCurrentResult(result, null);
              }}
              canGradeFreeform={currentCard.type !== 'concept_check' && revealed && !locked}
              disabled={locked}
            />
          </motion.div>
        </AnimatePresence>
      </SwipePane>

      <ActionBar
        showReveal={showReveal}
        showNext={showNext}
        canReveal={canReveal}
        canNext={canNext}
        onReveal={revealCurrentCard}
        onNext={() => {
          void goNext();
        }}
      />
    </section>
  );
};
