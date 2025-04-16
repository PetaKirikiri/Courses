import React, { createContext, useState, useEffect, useContext } from 'react';
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
  sentence_structures?: string[];  // Changed to plural and array type
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
  constituents: Constituent[];
  courses: Course[];
  loading: boolean;
  error: string | null;
}

export const DataContext = createContext<DataContextType>({
  lessons: [],
  sentenceStructures: [],
  tenseMarkers: [],
  verbs: [],
  pronouns: [],
  constituents: [],
  courses: [],
  loading: true,
  error: null
});

export const useData = () => {
  const context = useContext(DataContext);
  if (!context) {
    throw new Error('useData must be used within a DataProvider');
  }
  return context;
};

export const DataProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [sentenceStructures, setSentenceStructures] = useState<SentenceStructure[]>([]);
  const [tenseMarkers, setTenseMarkers] = useState<TenseMarker[]>([]);
  const [verbs, setVerbs] = useState<Verb[]>([]);
  const [pronouns, setPronouns] = useState<Pronoun[]>([]);
  const [constituents, setConstituents] = useState<Constituent[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [
          lessonsData,
          sentenceStructuresData,
          tenseMarkersData,
          verbsData,
          pronounsData,
          constituentsData,
          coursesData
        ] = await Promise.all([
          db.getRecords<Lesson>('lessons'),
          db.getRecords<SentenceStructure>('sentence_structures'),
          db.getRecords<TenseMarker>('tense_markers'),
          db.getRecords<Verb>('verbs'),
          db.getRecords<Pronoun>('pronouns'),
          db.getRecords<Constituent>('constituents'),
          db.getRecords<Course>('courses')
        ]);

        setLessons(lessonsData);
        setSentenceStructures(sentenceStructuresData);
        setTenseMarkers(tenseMarkersData);
        setVerbs(verbsData);
        setPronouns(pronounsData);
        setConstituents(constituentsData);
        setCourses(coursesData);
        setLoading(false);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  return (
    <DataContext.Provider value={{
      lessons,
      sentenceStructures,
      tenseMarkers,
      verbs,
      pronouns,
      constituents,
      courses,
      loading,
      error
    }}>
      {children}
    </DataContext.Provider>
  );
}; 