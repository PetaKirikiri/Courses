import React, { createContext, useState, useContext, useMemo, useRef } from 'react';
import { db } from '../db/airtable';

// Base record type that all records extend
export interface BaseRecord {
  id: string;
}

export interface SentenceStructure extends BaseRecord {
  sentence_name: string;
  sentence_schema: string;  // comma-separated list of component types like "tense_markers,verbs,pronouns"
}

export interface Lesson extends BaseRecord {
  lesson_name: string;
  display_name: string;
  courses: string[];
  lesson_outcomes?: string;
  sentence_structures?: string[];
  available_vocabulary?: {
    verbs?: string[];
    nouns?: string[];
    pronouns?: string[];
    tense_markers?: string[];
  };
}

export interface Course extends BaseRecord {
  course_name: string;
  lessons: string[];
}

export interface TenseMarker extends BaseRecord {
  display_name: string;
  english: string;
}

export interface Verb extends BaseRecord {
  display_name: string;
}

export interface Pronoun extends BaseRecord {
  display_name: string;
}

export interface Determiner extends BaseRecord {
  display_name: string;
}

export interface ConcreteNoun extends BaseRecord {
  display_name: string;
}

export interface Constituent {
  id: string;
  Name: string;
  constituent_schema: string;
}

export interface DataContextType {
  lessons: Lesson[];
  sentenceStructures: SentenceStructure[];
  tenseMarkers: TenseMarker[];
  verbs: Verb[];
  pronouns: Pronoun[];
  determiners: Determiner[];
  concreteNouns: ConcreteNoun[];
  constituents: Constituent[];
  courses: Course[];
  loading: boolean;
  error: string | null;
  get: (path: string) => any;
  lessonMap: Record<string, Lesson>;
  courseMap: Record<string, Course>;
  sentenceStructureMap: Record<string, SentenceStructure>;
  constituentMap: Record<string, Constituent>;
}

export const DataContext = createContext<DataContextType>({
  lessons: [],
  sentenceStructures: [],
  tenseMarkers: [],
  verbs: [],
  pronouns: [],
  determiners: [],
  concreteNouns: [],
  constituents: [],
  courses: [],
  loading: true,
  error: null,
  get: () => null,
  lessonMap: {},
  courseMap: {},
  sentenceStructureMap: {},
  constituentMap: {}
});

export const useData = () => {
  const context = useContext(DataContext);
  if (!context) {
    throw new Error('useData must be used within a DataProvider');
  }
  return context;
};

// Simple helper to safely get nested object properties
const getNestedValue = (obj: any, path: string): any => {
  return path.split('.').reduce((current, key) => {
    // Handle array access with [index]
    if (key.includes('[') && key.includes(']')) {
      const arrayKey = key.split('[')[0];
      const index = parseInt(key.split('[')[1].split(']')[0]);
      return current?.[arrayKey]?.[index];
    }
    return current?.[key];
  }, obj);
};

export const DataProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const cache = useRef(db.getCachedRecords('courses'));
  
  // Read all data from cache
  const lessons = db.getCachedRecords<Lesson>('lessons');
  const sentenceStructures = db.getCachedRecords<SentenceStructure>('sentence_structures');
  const tenseMarkers = db.getCachedRecords<TenseMarker>('tense_markers');
  const verbs = db.getCachedRecords<Verb>('verbs');
  const pronouns = db.getCachedRecords<Pronoun>('pronouns');
  const determiners = db.getCachedRecords<Determiner>('determiners');
  const concreteNouns = db.getCachedRecords<ConcreteNoun>('concrete_nouns');
  const constituents = db.getCachedRecords<Constituent>('constituents');
  const courses = db.getCachedRecords<Course>('courses');

  // Create lookup maps
  const lessonMap = useMemo(() => 
    Object.fromEntries(lessons.map(l => [l.id, l])), [lessons]
  );

  const courseMap = useMemo(() => 
    Object.fromEntries(courses.map(c => [c.id, c])), [courses]
  );

  const sentenceStructureMap = useMemo(() => 
    Object.fromEntries(sentenceStructures.map(s => [s.id, s])), [sentenceStructures]
  );

  const constituentMap = useMemo(() => 
    Object.fromEntries(constituents.map(c => [c.id, c])), [constituents]
  );

  // Helper function to get nested data
  const get = (path: string) => getNestedValue(cache.current, path);

  return (
    <DataContext.Provider value={{
      lessons,
      sentenceStructures,
      tenseMarkers,
      verbs,
      pronouns,
      determiners,
      concreteNouns,
      constituents,
      courses,
      loading: false,
      error: null,
      get,
      lessonMap,
      courseMap,
      sentenceStructureMap,
      constituentMap
    }}>
      {children}
    </DataContext.Provider>
  );
}; 