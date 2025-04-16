import React from 'react';
import Typography from '@mui/material/Typography';
import '../../styles/components/Lessons/LessonOutcomes.css';

interface LessonOutcomesProps {
  lesson_outcomes: string;
}

const LessonOutcomes: React.FC<LessonOutcomesProps> = ({ lesson_outcomes }) => {
  if (!lesson_outcomes) {
    return null;
  }

  return (
    <div className="lessonOutcomes">
      <Typography variant="body1">
        {lesson_outcomes}
      </Typography>
    </div>
  );
};

export default LessonOutcomes; 