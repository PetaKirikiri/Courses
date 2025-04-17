import React, { useMemo } from 'react';
import { useData } from '../context/DataContext';
import CourseCard from '../components/CourseCard';
import Button from '@mui/material/Button';
import RefreshIcon from '@mui/icons-material/Refresh';
import { db } from '../db/airtable';
import '../styles/global.css';
import '../styles/pages/CoursePage.css';

const CoursePage: React.FC = () => {
  const { courses, loading } = useData();

  const handleRefresh = () => {
    try {
      db.clearCache();
      window.location.reload();
    } catch (error) {
      console.error('Failed to clear cache:', error);
    }
  };

  const sortedCourses = useMemo(() => {
    if (!Array.isArray(courses)) return [];
    return [...courses].sort((a, b) => 
      a.course_name.localeCompare(b.course_name)
    );
  }, [courses]);

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!sortedCourses.length) {
    return <div>No courses found</div>;
  }

  return (
    <div className="coursePage">
      <div className="header">
        <h1>Courses</h1>
        <Button
          startIcon={<RefreshIcon />}
          onClick={handleRefresh}
        >
          Refresh Data
        </Button>
      </div>
      <div className="courseGrid">
        {sortedCourses.map((course) => (
          <CourseCard key={course.id} course={course} />
        ))}
      </div>
    </div>
  );
};

export default CoursePage; 