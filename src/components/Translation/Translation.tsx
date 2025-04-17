import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useData } from '../../context/DataContext';
import { Typography } from '@mui/material';
import { DragDropContext, Droppable, DropResult } from 'react-beautiful-dnd';
import { VerbConstituent, SubjectConstituent, ObjectConstituent, NominalConstituent } from '../Constituents/constituentExports';

interface TranslationProps {
  sentenceStructureId: string;
}

interface ConstituentState {
  id: string;
  type: string;
  schema: string;
}

export const Translation: React.FC<TranslationProps> = ({ sentenceStructureId }) => {
  const { getTranslationData } = useData();
  const [constituentStates, setConstituentStates] = useState<ConstituentState[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  const translationData = useMemo(() => 
    getTranslationData(sentenceStructureId),
    [getTranslationData, sentenceStructureId]
  );

  useEffect(() => {
    if (!translationData || !translationData.constituents) {
      setIsLoading(false);
      return;
    }
    
    const initialStates = translationData.constituents
      .map((constituent) => {
        const type = constituent.Name || constituent.name;
        if (!type) return null;
        
        return {
          id: constituent.id,
          type,
          schema: constituent.constituent_schema
        };
      })
      .filter((state): state is ConstituentState => state !== null);
    
    if (initialStates.length > 0) {
      setConstituentStates(initialStates);
    }
    setIsLoading(false);
  }, [translationData]);

  const handleDragEnd = useCallback((result: DropResult) => {
    if (!result.destination) return;
    const sourceIndex = result.source.index;
    const destinationIndex = result.destination.index;

    setConstituentStates(prevStates => {
      const newStates = Array.from(prevStates);
      const [reorderedItem] = newStates.splice(sourceIndex, 1);
      newStates.splice(destinationIndex, 0, reorderedItem);
      return newStates;
    });
  }, []);

  const isInCorrectPosition = useCallback((index: number, id: string) => {
    if (!translationData?.constituents) return false;
    return translationData.constituents[index]?.id === id;
  }, [translationData]);

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (!translationData) {
    return <div>No sentence structure found</div>;
  }

  const { constituents, sentence_name } = translationData;

  if (!constituents || constituents.length === 0) {
    return <div>No constituents found</div>;
  }

  // Only render the drag and drop context when we have data
  if (constituentStates.length === 0) {
    return <div>No constituents to display</div>;
  }

  return (
    <div style={{ padding: '20px' }}>
      <Typography variant="h6" gutterBottom align="center">
        {sentence_name}
      </Typography>
      
      <DragDropContext onDragEnd={handleDragEnd}>
        <Droppable 
          droppableId={sentenceStructureId}
          direction="horizontal"
          isDropDisabled={false}
          isCombineEnabled={false}
          ignoreContainerClipping={false}
        >
          {(provided) => (
            <div 
              ref={provided.innerRef}
              {...provided.droppableProps}
              style={{ 
                display: 'flex', 
                gap: '20px',
                width: '100%',
                justifyContent: 'center'
              }}
            >
              {constituentStates.map((constituentState, index) => {
                const type = constituentState.type.toLowerCase();
                const props = {
                  type: constituentState.type,
                  schema: constituentState.schema,
                  isInCorrectPosition: isInCorrectPosition(index, constituentState.id),
                  index
                };

                if (type === 'verbs') {
                  return <VerbConstituent key={constituentState.id} {...props} />;
                }
                if (type === 'noun_pronoun') {
                  return <SubjectConstituent key={constituentState.id} {...props} />;
                }
                if (type.startsWith('object_')) {
                  return <ObjectConstituent key={constituentState.id} {...props} />;
                }
                return <NominalConstituent key={constituentState.id} {...props} />;
              })}
              {provided.placeholder}
            </div>
          )}
        </Droppable>
      </DragDropContext>
    </div>
  );
};

export default Translation; 