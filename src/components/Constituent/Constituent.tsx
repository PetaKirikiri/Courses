import React from 'react';
import { useData } from '../../context/DataContext';
import { Dropdown } from '../Dropdowns/Dropdown';

interface ConstituentProps {
  type: string;
  schema: string;
}

const Constituent: React.FC<ConstituentProps> = ({ type, schema }) => {
  const { tenseMarkers, verbs, pronouns } = useData();
  const [selections, setSelections] = React.useState<Record<string, string>>({});

  // Parse the constituent schema to determine which dropdowns to show
  const components = schema.split(',').map(s => s.trim());

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
    }

    return options;
  };

  const handleSelectionChange = (componentType: string, value: string) => {
    setSelections(prev => ({
      ...prev,
      [componentType]: value
    }));
  };

  return (
    <div style={{ 
      border: '1px solid #ccc', 
      padding: '10px', 
      borderRadius: '4px',
      marginBottom: '10px'
    }}>
      <h3 style={{ marginTop: 0 }}>
        {type.split('_')
          .map(word => word.charAt(0).toUpperCase() + word.slice(1))
          .join(' ')}
      </h3>
      <div style={{ display: 'flex', gap: '10px' }}>
        {components.map(componentType => (
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
        ))}
      </div>
    </div>
  );
};

export default Constituent; 