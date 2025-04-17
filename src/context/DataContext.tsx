import React, { createContext, useState, useContext, useMemo, useRef, useEffect, useCallback } from 'react';
import { db } from '../db/airtable';

// Base record type that all records extend
export interface BaseRecord {
  id: string;
}

export interface SentenceStructure extends BaseRecord {
  sentence_name: string;
  constituents: Constituent[];  // Array of linked constituent records
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
  name?: string;  // Some records use name instead of course_name
  lessons: Lesson[];  // This is now an array of resolved Lesson objects, not just strings
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
  display_name?: string;
  Name: string;
  english?: string;
}

export interface ConcreteNoun extends BaseRecord {
  display_name?: string;
  Name: string;
  english?: string;
}

export interface ObjectMarker extends BaseRecord {
  display_name?: string;
  Name: string;
  english?: string;
}

export interface Constituent extends BaseRecord {
  id: string;
  Name: string;
  name?: string;  // Some records might use lowercase name
  constituent_schema: string;
  parts_of_speech?: string[];  // Array of linked parts of speech records
}

export interface TranslationData {
  id: string;
  constituents: Constituent[];
  sentence_name: string;
}

export interface DataContextType {
  lessons: Lesson[];
  sentenceStructures: SentenceStructure[];
  tenseMarkers: TenseMarker[];
  verbs: Verb[];
  pronouns: Pronoun[];
  determiners: Determiner[];
  concreteNouns: ConcreteNoun[];
  objectMarkers: ObjectMarker[];
  constituents: Constituent[];
  courses: Course[];
  loading: boolean;
  error: string | null;
  get: (path: string) => any;
  lessonMap: Record<string, Lesson>;
  courseMap: Record<string, Course>;
  sentenceStructureMap: Record<string, SentenceStructure>;
  constituentMap: Record<string, Constituent>;
  getCourseCardData: (courseId: string) => {
    id: string;
    course_name: string;
    lessons: Array<{
      id: string;
      display_name: string;
      lesson_name: string;
    }>;
  } | null;
  getTranslationData: (sentenceStructureId: string) => TranslationData | null;
}

export const DataContext = createContext<DataContextType>({
  lessons: [],
  sentenceStructures: [],
  tenseMarkers: [],
  verbs: [],
  pronouns: [],
  determiners: [],
  concreteNouns: [],
  objectMarkers: [],
  constituents: [],
  courses: [],
  loading: true,
  error: null,
  get: () => null,
  lessonMap: {},
  courseMap: {},
  sentenceStructureMap: {},
  constituentMap: {},
  getCourseCardData: () => null,
  getTranslationData: () => null
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
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const cache = useRef(db.getCachedRecords('courses'));

  // Force refresh cache on mount
  useEffect(() => {
    const refreshData = async () => {
      try {
        setLoading(true);
        await db.refreshCache();
        setLoading(false);
      } catch (err) {
        setError('Failed to load data');
        setLoading(false);
      }
    };

    refreshData();
  }, []);
  
  // Read all data from cache
  const lessons = db.getCachedRecords<Lesson>('lessons');
  const sentenceStructures = db.getCachedRecords<SentenceStructure>('sentence_structures');
  const tenseMarkers = db.getCachedRecords<TenseMarker>('tense_markers');
  const verbs = db.getCachedRecords<Verb>('verbs');
  const pronouns = db.getCachedRecords<Pronoun>('pronouns');
  const determiners = db.getCachedRecords<Determiner>('determiners');
  const concreteNouns = db.getCachedRecords<ConcreteNoun>('concrete_nouns');
  const objectMarkers = db.getCachedRecords<ObjectMarker>('object_markers');
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

  // Specific helper for CourseCard data
  const getCourseCardData = useCallback((courseId: string) => {
    const course = courseMap[courseId];
    if (!course) {
      return null;
    }

    // The lessons are already resolved and nested in the course object
    const lessonRecords = course.lessons.map(lesson => ({
      id: lesson.id,
      display_name: lesson.display_name,
      lesson_name: lesson.lesson_name
    }));

    return {
      id: course.id,
      course_name: course.course_name || course.name || 'Untitled Course',
      lessons: lessonRecords
    };
  }, [courseMap]);

  const getTranslationData = useCallback((sentenceStructureId: string) => {
    const sentenceStructure = sentenceStructureMap[sentenceStructureId];
    
    if (!sentenceStructure) {
      return null;
    }

    // Resolve constituent IDs to full objects
    const resolvedConstituents = sentenceStructure.constituents
      .map(constituentId => {
        if (typeof constituentId === 'string') {
          return constituentMap[constituentId];
        }
        return constituentId;
      })
      .filter(constituent => constituent != null);

    return {
      id: sentenceStructure.id,
      constituents: resolvedConstituents,
      sentence_name: sentenceStructure.sentence_name
    };
  }, [sentenceStructureMap, constituentMap]);

  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

  return (
    <DataContext.Provider value={{
      lessons,
      sentenceStructures,
      tenseMarkers,
      verbs,
      pronouns,
      determiners,
      concreteNouns,
      objectMarkers,
      constituents,
      courses,
      loading,
      error,
      get,
      lessonMap,
      courseMap,
      sentenceStructureMap,
      constituentMap,
      getCourseCardData,
      getTranslationData
    }}>
      {children}
    </DataContext.Provider>
  );
}; 