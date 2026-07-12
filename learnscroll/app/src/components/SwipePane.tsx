import { useRef } from 'react';

interface SwipePaneProps {
  onSwipeUp: () => void;
  onSwipeDown: () => void;
  children: React.ReactNode;
}

const SWIPE_THRESHOLD = 60;

export const SwipePane = ({ onSwipeUp, onSwipeDown, children }: SwipePaneProps) => {
  const startYRef = useRef<number | null>(null);

  const handleTouchStart = (event: React.TouchEvent<HTMLDivElement>): void => {
    startYRef.current = event.touches[0]?.clientY ?? null;
  };

  const handleTouchEnd = (event: React.TouchEvent<HTMLDivElement>): void => {
    const startY = startYRef.current;
    const endY = event.changedTouches[0]?.clientY ?? null;

    if (startY === null || endY === null) {
      return;
    }

    const delta = startY - endY;
    if (delta > SWIPE_THRESHOLD) {
      onSwipeUp();
      return;
    }

    if (delta < -SWIPE_THRESHOLD) {
      onSwipeDown();
    }
  };

  return (
    <div className="swipe-pane" onTouchStart={handleTouchStart} onTouchEnd={handleTouchEnd}>
      {children}
    </div>
  );
};
