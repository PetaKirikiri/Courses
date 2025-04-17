import React, { useMemo, useState } from 'react';
import { useParams } from 'react-router-dom';
import Typography from '@mui/material/Typography';
import { useData } from '../../context/DataContext';
import Constituent from '../Constituent/Constituent';

interface ConstituentState {
  id: string;
  type: string;
  schema: string;
  isNounPronoun: boolean;
}

const Translation: React.FC = () => {
  const {
    lessons,
    sentenceStructures,
    constituents
  } = useData();
  
  const { lessonId } = useParams<{ lessonId: string }>();
  const [constituentStates, setConstituentStates] = useState<ConstituentState[]>([]);

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

    // Get the constituent types directly from the sentence schema
    const constituentTypes = structure.sentence_schema
      .split(',')
      .map(s => s.trim())
      .filter(s => s.length > 0);

    // Find the matching constituent schemas
    const foundConstituents = constituentTypes.map(type => {
      const constituent = constituents.find(c => c.Name === type);
      if (!constituent) {
        console.warn(`No constituent found for type: ${type}`);
      }
      return constituent;
    }).filter((c): c is typeof constituents[0] => c !== undefined);

    // Initialize constituent states if not already set
    if (constituentStates.length === 0) {
      const orderedConstituents = foundConstituents.map(c => ({
        id: c.id,
        type: c.Name,
        schema: c.constituent_schema,
        isNounPronoun: c.Name === 'noun_pronoun'
      }));

      setConstituentStates(orderedConstituents);
    }

    return foundConstituents;
  }, [structure?.sentence_schema, constituents, constituentStates.length]);

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
  const totalDropdowns = constituentStates.reduce((total, constituent) => {
    if (constituent.type.includes('noun_')) {
      // For noun constituents, check if it's in pronoun mode
      return total + (constituent.isNounPronoun ? 1 : 2);
    }
    // For other constituents, use their original schema
    return total + constituent.schema.split(',').length;
  }, 0);

  const handleConstituentTypeChange = (constituentId: string, newType: string) => {
    console.log(`Type change for ${constituentId}: ${newType}`);
    setConstituentStates(prev => {
      const newStates = prev.map(cs => 
        cs.id === constituentId
          ? { ...cs, isNounPronoun: newType === 'noun_pronoun' }
          : cs
      );
      return newStates;
    });
  };

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
        {constituentStates.map((constituent) => {
          let dropdownCount;
          let activeSchema = constituent.schema;

          if (constituent.type.includes('noun_')) {
            // For noun constituents, adjust schema based on toggle state
            dropdownCount = constituent.isNounPronoun ? 1 : 2;
            activeSchema = constituent.isNounPronoun ? 'pronouns' : 'determiners,concrete_nouns';
          } else {
            // For other constituents, use their original schema
            dropdownCount = constituent.schema.split(',').length;
          }

          console.log(`Constituent ${constituent.type} using schema: ${activeSchema}`);

          const width = `${(dropdownCount / totalDropdowns) * 100}%`;
          
          return (
            <div 
              key={constituent.id} 
              style={{ 
                width: width,
                maxWidth: width,
                transition: 'width 0.3s ease-in-out'
              }}
            >
              <Constituent 
                type={constituent.type}
                schema={activeSchema}
                onTypeChange={(newType) => handleConstituentTypeChange(constituent.id, newType)}
              />
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default Translation; 