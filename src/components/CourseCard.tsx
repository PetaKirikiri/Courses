import React from 'react';
import { Typography } from '@mui/material';
import { Link } from 'react-router-dom';
import { Course, useData } from '../context/DataContext';
import '../styles/components/Course/CourseCard.css';

interface CourseCardProps {
  course: Course;
}

const CourseCard: React.FC<CourseCardProps> = ({ course }) => {
  const { getCourseCardData } = useData();
  const courseData = getCourseCardData(course.id);
  
  if (!courseData) {
    return (
      <div className="courseCard">
        <div className="courseContent">
          <Typography variant="h5" component="h2" className="courseTitle">
            {course.course_name}
          </Typography>
          <div className="lessonsList">
            <Typography>No lessons available</Typography>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="courseCard">
      <div className="courseContent">
        <Typography variant="h5" component="h2" className="courseTitle">
          {courseData.course_name}
        </Typography>
        <div className="lessonsList">
          <ul>
            {courseData.lessons.map((lesson) => (
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