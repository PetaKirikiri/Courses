import React from 'react';
import { Link } from 'react-router-dom';
import { Course, Lesson } from '../../context/DataContext';
import '../../styles/components/Course/CourseCard.css';

interface CourseCardProps {
  id: string;
  name: string;
  lessons: Lesson[];
}

const CourseCard: React.FC<CourseCardProps> = ({ id, name, lessons }) => {
  return (
    <div className="course-card">
      <h2>{name}</h2>
      <div className="lessons-list">
        <ul>
          {lessons && lessons.length > 0 ? (
            lessons.map((lesson: Lesson) => (
              <li key={lesson.id}>
                <Link to={`/courses/${id}/lessons/${lesson.id}`}>
                  {lesson.display_name || lesson.lesson_name || 'Untitled Lesson'}
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