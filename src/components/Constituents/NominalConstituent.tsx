import React from 'react';
import BaseConstituent from './BaseConstituent';

interface NominalConstituentProps {
  type: string;
  schema: string;
  onTypeChange?: (newType: string) => void;
  onSelectionChange?: (componentType: string, value: string) => void;
  isInCorrectPosition?: boolean;
  index: number;
}

const NominalConstituent: React.FC<NominalConstituentProps> = (props) => {
  return (
    <BaseConstituent
      {...props}
      draggableId="NOMINAL_CONSTITUENT"
      correctColor="#e3f2fd"
    />
  );
};

export default NominalConstituent; 