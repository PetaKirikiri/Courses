import React, { useState, useEffect } from 'react';
import { useData } from '../../context/DataContext';
import { Switch, Select, MenuItem } from '@mui/material';
import { Draggable } from 'react-beautiful-dnd';

interface BaseConstituentProps {
  type: string;
  schema: string;
  onTypeChange?: (newType: string) => void;
  onSelectionChange?: (componentType: string, value: string) => void;
  isInCorrectPosition?: boolean;
  index: number;
  draggableId: string;
  correctColor?: string;
}

const BaseConstituent: React.FC<BaseConstituentProps> = ({ 
  type, 
  schema, 
  onTypeChange, 
  onSelectionChange,
  isInCorrectPosition = false,
  index,
  draggableId,
  correctColor = '#fff'
}) => {
  const { tenseMarkers, verbs, pronouns, determiners, concreteNouns, objectMarkers } = useData();
  const [selections, setSelections] = useState<Record<string, string>>({});
  const [isNounPronoun, setIsNounPronoun] = useState(type.includes('noun_pronoun'));
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const canBePronoun = type.includes('noun');
  const isObjectConstituent = type.includes('object_');
  const isSubjectConstituent = type.includes('subject_');
  const isVerbConstituent = type.includes('verb');

  const activeType = isNounPronoun ? 
    (isObjectConstituent ? 'object_noun_pronoun' : 'noun_pronoun') : 
    type;
  const activeSchema = isNounPronoun ? 'pronouns' : schema;
  const components = activeSchema.split(',').map(c => c.trim());

  const getPlaceholderText = (componentType: string): string => {
    switch (componentType) {
      case 'tense_markers':
        return 'Tense';
      case 'verbs':
        return 'Verb';
      case 'pronouns':
        return 'Pronoun';
      case 'determiners':
        return 'Det';
      case 'concrete_nouns':
        return 'Noun';
      case 'object_markers':
        return 'Obj';
      default:
        return componentType;
    }
  };

  const getOptionsForComponent = (componentType: string) => {
    let options: Array<{ id: string; displayValue: string }> = [];
    
    switch (componentType) {
      case 'tense_markers':
        options = tenseMarkers?.map(tm => ({
          id: tm.id,
          displayValue: tm.display_name
        })) || [];
        break;
      case 'verbs':
        options = verbs?.map(v => ({
          id: v.id,
          displayValue: v.display_name
        })) || [];
        break;
      case 'pronouns':
        options = pronouns?.map(p => ({
          id: p.id,
          displayValue: p.display_name
        })) || [];
        break;
      case 'determiners':
        options = determiners?.map(d => ({
          id: d.id,
          displayValue: d.Name
        })) || [];
        break;
      case 'concrete_nouns':
        options = concreteNouns?.map(n => ({
          id: n.id,
          displayValue: n.Name
        })) || [];
        break;
      case 'object_markers':
        options = objectMarkers?.map(om => ({
          id: om.id,
          displayValue: om.Name
        })) || [];
        break;
    }
    return options;
  };

  const handleSelectionChange = (componentType: string, value: string) => {
    setSelections(prev => ({
      ...prev,
      [componentType]: value
    }));
    if (onSelectionChange) {
      onSelectionChange(componentType, value);
    }
  };

  const handleTypeToggle = () => {
    setIsNounPronoun(!isNounPronoun);
    setSelections({});
    if (onTypeChange) {
      onTypeChange(!isNounPronoun ? 
        (isObjectConstituent ? 'object_noun_pronoun' : 'noun_pronoun') : 
        type.replace('_pronoun', '')
      );
    }
  };

  if (!isMounted) {
    return null;
  }

  return (
    <Draggable 
      draggableId={draggableId} 
      index={index}
      isDragDisabled={false}
    >
      {(provided, snapshot) => (
        <div
          ref={provided.innerRef}
          {...provided.draggableProps}
          {...provided.dragHandleProps}
          style={{ 
            position: 'relative',
            padding: '10px',
            backgroundColor: isInCorrectPosition ? correctColor : '#fff',
            border: '1px solid #ccc',
            borderRadius: '4px',
            flex: 1,
            cursor: 'grab',
            userSelect: 'none',
            transition: 'background-color 0.2s ease-in-out',
            ...provided.draggableProps.style
          }}
        >
          <div 
            style={{ 
              position: 'absolute',
              top: '-12px',
              right: '10px',
              backgroundColor: 'white',
              padding: '0 5px',
              visibility: canBePronoun ? 'visible' : 'hidden',
              zIndex: 1
            }}
          >
            <Switch
              checked={isNounPronoun}
              onChange={handleTypeToggle}
              size="small"
            />
          </div>
          
          <div style={{ 
            display: 'flex', 
            gap: '4px',
            pointerEvents: 'auto'
          }}>
            {components.map((componentType) => (
              <div key={componentType} style={{ flex: 1 }}>
                <Select
                  value={selections[componentType] || ''}
                  onChange={(e) => handleSelectionChange(componentType, e.target.value as string)}
                  fullWidth
                  displayEmpty
                  size="small"
                  sx={{
                    '& .MuiSelect-select': {
                      padding: '4px 8px'
                    }
                  }}
                >
                  <MenuItem value="" disabled>
                    {getPlaceholderText(componentType)}
                  </MenuItem>
                  {getOptionsForComponent(componentType).map((option) => (
                    <MenuItem key={option.id} value={option.id}>
                      {option.displayValue}
                    </MenuItem>
                  ))}
                </Select>
              </div>
            ))}
          </div>
        </div>
      )}
    </Draggable>
  );
};

export default BaseConstituent; 