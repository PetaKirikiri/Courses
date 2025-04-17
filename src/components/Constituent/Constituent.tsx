import React from 'react';
import { useData } from '../../context/DataContext';
import { Dropdown } from '../Dropdowns/Dropdown';
import { Switch, FormControlLabel } from '@mui/material';

interface ConstituentProps {
  type: string;
  schema: string;
  onTypeChange?: (newType: string) => void;
}

const Constituent: React.FC<ConstituentProps> = ({ type, schema, onTypeChange }) => {
  const { tenseMarkers, verbs, pronouns, determiners, concreteNouns } = useData();
  const [selections, setSelections] = React.useState<Record<string, string>>({});
  const [isNounPronoun, setIsNounPronoun] = React.useState(type === 'noun_pronoun');

  // Check if this is a noun-based constituent
  const isNounConstituent = type === 'noun_pronoun' || type === 'noun_concrete_nouns';

  // Get the active schema and type based on the toggle
  const activeType = isNounConstituent ? (isNounPronoun ? 'noun_pronoun' : 'noun_concrete_nouns') : type;
  const activeSchema = isNounConstituent ? (isNounPronoun ? 'pronouns' : 'determiners,concrete_nouns') : schema;
  const components = activeSchema.split(',').map(s => s.trim());

  console.log(`Constituent Render Details:
    Original Type: ${type}
    Is Noun Constituent: ${isNounConstituent}
    Is Noun Pronoun: ${isNounPronoun}
    Active Type: ${activeType}
    Original Schema: ${schema}
    Active Schema: ${activeSchema}
    Components to Render: ${components.join(', ')}
  `);

  // Get options for a component type
  const getOptionsForComponent = (componentType: string) => {
    console.log(`Getting options for component: ${componentType}`);
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
    console.log(`Found ${options.length} options for ${componentType}`);
    return options;
  };

  const handleSelectionChange = (componentType: string, value: string) => {
    console.log(`Selection changed for ${componentType}: ${value}`);
    setSelections(prev => ({
      ...prev,
      [componentType]: value
    }));
  };

  const handleTypeToggle = (event: React.ChangeEvent<HTMLInputElement>) => {
    const newIsNounPronoun = event.target.checked;
    console.log(`Type toggle changed:
      Previous: ${isNounPronoun ? 'noun_pronoun' : 'noun_concrete_nouns'}
      New: ${newIsNounPronoun ? 'noun_pronoun' : 'noun_concrete_nouns'}
    `);
    setIsNounPronoun(newIsNounPronoun);
    setSelections({}); // Clear selections when switching types
    if (onTypeChange) {
      onTypeChange(newIsNounPronoun ? 'noun_pronoun' : 'noun_concrete_nouns');
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
          <Switch
            checked={isNounPronoun}
            onChange={handleTypeToggle}
            color="primary"
          />
        )}
      </div>
      <div style={{ display: 'flex', gap: '10px' }}>
        {components.map(componentType => {
          console.log(`Rendering dropdown for: ${componentType}`);
          return (
            <div key={componentType} style={{ flex: 1 }}>
              <Dropdown
                label={componentType.split('_')
                  .map(word => word.charAt(0).toUpperCase() + word.slice(1))
                  .join(' ')}
                options={getOptionsForComponent(componentType)}
                value={selections[componentType] || ''}
                onChange={(value) => handleSelectionChange(componentType, value)}
              />
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default Constituent; 