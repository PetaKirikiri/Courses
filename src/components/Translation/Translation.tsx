import React, { useMemo } from 'react';
import { useParams } from 'react-router-dom';
import Typography from '@mui/material/Typography';
import { useData } from '../../context/DataContext';
import Constituent from '../Constituent/Constituent';

const Translation: React.FC = () => {
  const {
    lessons,
    sentenceStructures,
    constituents
  } = useData();
  
  const { lessonId } = useParams<{ lessonId: string }>();

  // Get the current lesson and its sentence structure from cache
  const currentLesson = useMemo(() => {
    const lesson = lessons.find(l => l.id === lessonId);
    return lesson;
  }, [lessons, lessonId]);
  
  // Get the sentence structure from cache
  const structure = useMemo(() => {
    const structureId = currentLesson?.sentence_structures?.[0];
    if (!structureId) {
      return null;
    }

    const found = sentenceStructures.find(s => s.id === structureId);
    return found;
  }, [currentLesson?.sentence_structures, sentenceStructures]);

  // Get the constituent schemas for each part
  const requiredConstituents = useMemo(() => {
    if (!structure?.sentence_schema) {
      return [];
    }

    // Get the constituent names from the sentence structure
    const constituentNames = structure.sentence_schema
      .split(',')
      .map(s => s.trim())
      .filter(s => s.length > 0);

    // Find the matching constituent schemas
    const foundConstituents = constituents.filter(c => {
      const match = constituentNames.includes(c.Name);
      return match;
    });

    return foundConstituents;
  }, [structure?.sentence_schema, constituents]);

  // Error states
  if (!currentLesson) {
    return <Typography color="error">Lesson not found</Typography>;
  }

  if (!structure) {
    return <Typography color="error">Sentence structure not found</Typography>;
  }

  if (!structure.sentence_schema) {
    return <Typography color="error">No sentence schema defined</Typography>;
  }

  // Calculate total dropdowns for proportional widths
  const totalDropdowns = requiredConstituents.reduce((total, constituent) => {
    const dropdownCount = constituent.constituent_schema.split(',').length;
    return total + dropdownCount;
  }, 0);

  return (
    <div style={{ padding: '20px' }}>
      <Typography variant="h6" gutterBottom align="center">
        {structure.sentence_name}
      </Typography>
      
      <div style={{ 
        display: 'flex', 
        gap: '20px',
        width: '100%',
        justifyContent: 'center'
      }}>
        {requiredConstituents.map((constituent) => {
          const dropdownCount = constituent.constituent_schema.split(',').length;
          // Adjust width calculation to account for gap
          const width = `${(dropdownCount / totalDropdowns) * 100}%`;
          
          return (
            <div 
              key={constituent.id} 
              style={{ 
                width: width,
                maxWidth: width
              }}
            >
              <Constituent 
                type={constituent.Name}
                schema={constituent.constituent_schema}
              />
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default Translation; 