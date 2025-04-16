import React from 'react';
import Typography from '@mui/material/Typography';
import '../../styles/components/Lessons/LessonHeader.css';

interface LessonHeaderProps {
  lesson_name: string;
  display_name: string;
}

const LessonHeader: React.FC<LessonHeaderProps> = ({ lesson_name, display_name }) => {
  return (
    <div className="lessonHeader">
      <Typography variant="h4" component="h1">
        {lesson_name}
      </Typography>
      {display_name && (
        <Typography variant="h5" component="h2">
          {display_name}
        </Typography>
      )}
    </div>
  );
};

export default LessonHeader; 