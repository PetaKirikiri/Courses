import React from 'react';
import { Typography } from '@mui/material';
import { Link } from 'react-router-dom';
import { Course, useData } from '../context/DataContext';
import '../styles/components/Course/CourseCard.css';

interface CourseCardProps {
  course: Course;
}

const CourseCard: React.FC<CourseCardProps> = ({ course }) => {
  const { lessons: allLessons } = useData();
  
  // Create a map for quick lesson lookup
  const lessonMap = new Map(allLessons.map(lesson => [lesson.id, lesson]));
  
  // Get lessons in the order specified by course.lessons
  const courseLessons = course.lessons
    .map(id => lessonMap.get(id))
    .filter((lesson): lesson is NonNullable<typeof lesson> => lesson != null);

  return (
    <div className="courseCard">
      <div className="courseContent">
        <Typography variant="h5" component="h2" className="courseTitle">
          {course.course_name}
        </Typography>
        <div className="lessonsList">
          <ul>
            {courseLessons.map((lesson) => (
              <li key={lesson.id} className="lessonItem">
                <Link to={`/lesson/${lesson.id}`}>
                  {lesson.display_name || lesson.lesson_name}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
};

export default CourseCard;