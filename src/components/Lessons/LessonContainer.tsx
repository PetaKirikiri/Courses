import React from 'react';
import '../../styles/components/Lessons/LessonContainer.css';

interface LessonContainerProps {
  children?: React.ReactNode;
}

const LessonContainer: React.FC<LessonContainerProps> = ({ children }) => {
  return (
    <div className="lessonContainer">
      {children}
    </div>
  );
};

export default LessonContainer; 