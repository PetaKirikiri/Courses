import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useData } from '../context/DataContext';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import LessonContainer from '../components/Lessons/LessonContainer';
import LessonHeader from '../components/Lessons/LessonHeader';
import LessonOutcomes from '../components/Lessons/LessonOutcomes';
import Translation from '../components/Translation/Translation';
import '../styles/global.css';
import '../styles/pages/LessonPage.css';

export const LessonPage: React.FC = () => {
  const navigate = useNavigate();
  const { lessonId } = useParams<{ lessonId: string }>();
  const { lessons, loading } = useData();

  if (loading) {
    return <Typography>Loading...</Typography>;
  }

  const lesson = lessons.find(l => l.id === lessonId);

  if (!lesson) {
    return <Typography>Lesson not found</Typography>;
  }

  return (
    <div className="page page-narrow">
      <Button
        startIcon={<ArrowBackIcon />}
        onClick={() => navigate('/')}
        sx={{ mb: 2 }}
      >
        Back to Courses
      </Button>

      <LessonContainer>
        <LessonHeader
          lesson_name={lesson.lesson_name || ''}
          display_name={lesson.display_name || ''}
        />
      </LessonContainer>

      <LessonContainer>
        <LessonOutcomes lesson_outcomes={lesson.lesson_outcomes || ''} />
      </LessonContainer>

      <LessonContainer>
        <Translation />
      </LessonContainer>
    </div>
  );
};

export default LessonPage; 