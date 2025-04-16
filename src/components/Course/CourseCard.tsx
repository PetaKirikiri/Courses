import React from 'react';
import { Link } from 'react-router-dom';
import { Course, useData } from '../../context/DataContext';
import '../../styles/components/Course/CourseCard.css';

interface CourseCardProps {
  course: Course;
}

const CourseCard: React.FC<CourseCardProps> = ({ course }) => {
  const { id, course_name, lessons = [] } = course;
  const { lessons: allLessons } = useData();

  // Create a map of lesson IDs to display names
  const lessonMap = new Map(
    allLessons.map(lesson => [lesson.id, lesson.display_name])
  );

  return (
    <div className="courseCard">
      <h2 className="courseTitle">{course_name}</h2>
      <div className="lessonsList">
        <h3>Lessons</h3>
        <ul>
          {lessons && lessons.length > 0 ? (
            lessons.map((lessonId: string) => (
              <li key={lessonId}>
                <Link to={`/courses/${id}/lessons/${lessonId}`}>
                  {lessonMap.get(lessonId) || 'Untitled Lesson'}
                </Link>
              </li>
            ))
          ) : (
            <li>No lessons available</li>
          )}
        </ul>
      </div>
    </div>
  );
};

export default CourseCard; 