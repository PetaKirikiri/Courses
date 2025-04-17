import React from 'react';
import BaseConstituent from './BaseConstituent';

interface SubjectConstituentProps {
  type: string;
  schema: string;
  onTypeChange?: (newType: string) => void;
  onSelectionChange?: (componentType: string, value: string) => void;
  isInCorrectPosition?: boolean;
  index: number;
}

const SubjectConstituent: React.FC<SubjectConstituentProps> = (props) => {
  return (
    <BaseConstituent
      {...props}
      draggableId="SUBJECT_CONSTITUENT"
      correctColor="#e8f5e9"
    />
  );
};

export default SubjectConstituent; 