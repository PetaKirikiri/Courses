import React, { useState } from 'react';
import { useData } from '../../context/DataContext';
import { Dropdown } from '../Dropdowns/Dropdown';
import { Switch, FormControlLabel } from '@mui/material';
import { Select, MenuItem } from '@mui/material';

interface ConstituentProps {
  type: string;
  schema: string;
  onTypeChange?: (newType: string) => void;
  onSelectionChange?: (componentType: string, value: string) => void;
}

const Constituent: React.FC<ConstituentProps> = ({ type, schema, onTypeChange, onSelectionChange }) => {
  const { tenseMarkers, verbs, pronouns, determiners, concreteNouns } = useData();
  const [selections, setSelections] = React.useState<Record<string, string>>({});
  const [isNounPronoun, setIsNounPronoun] = useState(type === 'noun_pronoun');

  // Check if this is a noun-based constituent
  const isNounConstituent = type.includes('noun_');

  // Get the active schema and type based on the toggle
  const activeType = isNounPronoun ? 'noun_pronoun' : type;
  const activeSchema = isNounPronoun ? 'pronouns' : schema;
  const components = activeSchema.split(',');

  // Get options for a component type
  const getOptionsForComponent = (componentType: string) => {
    let options: Array<{ id: string; displayValue: string }> = [];
    
    switch (componentType) {
      case 'tense_markers':
        options = tenseMarkers.map(tm => ({
          id: tm.id,
          displayValue: tm.display_name
        }));
        break;
      case 'verbs':
        options = verbs.map(v => ({
          id: v.id,
          displayValue: v.display_name
        }));
        break;
      case 'pronouns':
        options = pronouns.map(p => ({
          id: p.id,
          displayValue: p.display_name
        }));
        break;
      case 'determiners':
        options = determiners.map(d => ({
          id: d.id,
          displayValue: d.display_name
        }));
        break;
      case 'concrete_nouns':
        options = concreteNouns.map(n => ({
          id: n.id,
          displayValue: n.display_name
        }));
        break;
    }
    return options;
  };

  const handleSelectionChange = (componentType: string, value: string) => {
    if (onSelectionChange) {
      onSelectionChange(componentType, value);
    }
  };

  const handleTypeToggle = () => {
    setIsNounPronoun(!isNounPronoun);
    if (onTypeChange) {
      onTypeChange(!isNounPronoun ? 'noun_pronoun' : type);
    }
  };

  return (
    <div style={{ 
      border: '1px solid #ccc', 
      padding: '10px', 
      borderRadius: '4px',
      marginBottom: '10px'
    }}>
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        marginBottom: '10px'
      }}>
        <h3 style={{ margin: 0 }}>
          {activeType.split('_')
            .map(word => word.charAt(0).toUpperCase() + word.slice(1))
            .join(' ')}
        </h3>
        {isNounConstituent && (
          <FormControlLabel
            control={
              <Switch
                checked={isNounPronoun}
                onChange={handleTypeToggle}
              />
            }
            label="Use Pronoun"
          />
        )}
      </div>
      <div style={{ display: 'flex', gap: '10px' }}>
        {components.map((componentType) => {
          return (
            <div key={componentType} style={{ flex: 1 }}>
              <Select
                value=""
                onChange={(e) => handleSelectionChange(componentType, e.target.value)}
                fullWidth
                style={{ marginTop: '10px' }}
              >
                {getOptionsForComponent(componentType).map((option) => (
                  <MenuItem key={option.id} value={option.id}>
                    {option.displayValue}
                  </MenuItem>
                ))}
              </Select>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default Constituent; 