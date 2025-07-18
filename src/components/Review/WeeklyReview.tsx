import React from 'react';
import { useGTDStore } from '../../store/gtdStore';
import { EnhancedWeeklyReview } from './EnhancedWeeklyReview';
import { WeeklyReviewData } from '../../types/gtd';

interface WeeklyReviewProps {
  isOpen: boolean;
  onClose: () => void;
  onComplete: () => void;
}

export const WeeklyReview: React.FC<WeeklyReviewProps> = ({
  isOpen,
  onClose,
  onComplete
}) => {
  const { saveWeeklyReview } = useGTDStore();

  const handleReviewComplete = (reviewData: WeeklyReviewData) => {
    saveWeeklyReview(reviewData);
    onComplete();
    onClose();
  };

  return (
    <EnhancedWeeklyReview
      isOpen={isOpen}
      onClose={onClose}
      onComplete={handleReviewComplete}
    />
  );
};