import React from 'react';
import BaseConstituent from './BaseConstituent';

interface ObjectConstituentProps {
  type: string;
  schema: string;
  onTypeChange?: (newType: string) => void;
  onSelectionChange?: (componentType: string, value: string) => void;
  isInCorrectPosition?: boolean;
  index: number;
}

const ObjectConstituent: React.FC<ObjectConstituentProps> = (props) => {
  return (
    <BaseConstituent
      {...props}
      draggableId="OBJECT_CONSTITUENT"
      correctColor="#ffebee"
    />
  );
};

export default ObjectConstituent;
