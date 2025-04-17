import React from 'react';
import BaseConstituent from './BaseConstituent';

interface VerbConstituentProps {
  type: string;
  schema: string;
  onTypeChange?: (newType: string) => void;
  onSelectionChange?: (componentType: string, value: string) => void;
  isInCorrectPosition?: boolean;
  index: number;
}

const VerbConstituent: React.FC<VerbConstituentProps> = (props) => {
  return (
    <BaseConstituent
      {...props}
      draggableId="VERB_CONSTITUENT"
      correctColor="#fff3e0"
    />
  );
};

export default VerbConstituent; 