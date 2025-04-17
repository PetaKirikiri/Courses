import Airtable from "airtable";

const apiKey = process.env.REACT_APP_AIRTABLE_API_KEY;
const baseId = process.env.REACT_APP_AIRTABLE_BASE_ID;

const airtable = new Airtable({
  apiKey: apiKey,
});

const base = airtable.base(baseId || "");

interface BaseRecord {
  id: string;
  [key: string]: any;
}

class AirtableDB {
  private static instance: AirtableDB;
  private dataCache: Record<string, any[]> = {};
  private schemaCache: Record<string, any> = {};
  private readonly CACHE_KEY = "airtable_cache";
  private readonly SCHEMA_CACHE_KEY = "airtable_schema_cache";
  private fetchingTables: Set<string> = new Set();

  private constructor() {
    this.loadFromLocalStorage();
  }

  private loadFromLocalStorage() {
    const savedCache = localStorage.getItem(this.CACHE_KEY);
    const savedSchemaCache = localStorage.getItem(this.SCHEMA_CACHE_KEY);

    if (savedCache) {
      try {
        this.dataCache = JSON.parse(savedCache);
      } catch (e) {
        this.dataCache = {};
      }
    }

    if (savedSchemaCache) {
      try {
        this.schemaCache = JSON.parse(savedSchemaCache);
      } catch (e) {
        this.schemaCache = {};
      }
    }
  }

  public static getInstance(): AirtableDB {
    if (!AirtableDB.instance) {
      AirtableDB.instance = new AirtableDB();
    }
    return AirtableDB.instance;
  }

  public async getRecords<T extends BaseRecord>(
    tableName: string
  ): Promise<T[]> {
    if (this.dataCache[tableName]) {
      return this.dataCache[tableName] as T[];
    }

    if (this.fetchingTables.has(tableName)) {
      while (this.fetchingTables.has(tableName)) {
        await new Promise((resolve) => setTimeout(resolve, 100));
      }
      return this.dataCache[tableName] as T[];
    }

    this.fetchingTables.add(tableName);

    try {
      const records = await base(tableName).select().all();
      const data = records.map((record) => ({
        id: record.id,
        ...record.fields,
      }));

      this.dataCache[tableName] = data;
      this.saveCache();

      this.fetchingTables.delete(tableName);
      return data as T[];
    } catch (err) {
      this.fetchingTables.delete(tableName);
      throw new Error(`Failed to fetch ${tableName}`);
    }
  }

  public saveCache() {
    try {
      localStorage.setItem(this.CACHE_KEY, JSON.stringify(this.dataCache));
      localStorage.setItem(
        this.SCHEMA_CACHE_KEY,
        JSON.stringify(this.schemaCache)
      );
    } catch (e) {}
  }

  public clearCache() {
    this.dataCache = {};
    this.schemaCache = {};
    localStorage.removeItem(this.CACHE_KEY);
    localStorage.removeItem(this.SCHEMA_CACHE_KEY);
  }

  public getCachedRecords<T extends BaseRecord>(tableName: string): T[] {
    return this.dataCache[tableName] || [];
  }

  public async refreshCache() {
    this.dataCache = {};
    this.schemaCache = {};
    localStorage.removeItem(this.CACHE_KEY);
    localStorage.removeItem(this.SCHEMA_CACHE_KEY);

    try {
      const [courses, constituents] = await Promise.all([
        this.getRecords("courses"),
        this.getRecords("constituents"),
      ]);

      courses.forEach((course) => (course.__sourceTable = "courses"));
      constituents.forEach(
        (constituent) => (constituent.__sourceTable = "constituents")
      );

      const requiredTables = [
        "lessons",
        "sentence_structures",
        "tense_markers",
        "verbs",
        "pronouns",
        "determiners",
        "concrete_nouns",
        "object_markers",
        "parts_of_speech",
      ];

      await Promise.all(
        requiredTables.map(async (table) => {
          try {
            const records = await this.getRecords(table);
            records.forEach((record) => (record.__sourceTable = table));
          } catch (err) {
            // Skip failed tables
          }
        })
      );

      const resolvedCourses = await Promise.all(
        courses.map(async (course) => {
          const processedTables = new Set([
            "courses",
            "constituents",
            ...requiredTables,
          ]);
          const resolved = await this.resolveLinkedRecords(
            course,
            processedTables,
            new Set(),
            new Set()
          );
          return resolved;
        })
      );

      this.dataCache["courses"] = resolvedCourses;
      this.saveCache();
      return resolvedCourses;
    } catch (err) {
      throw new Error("Failed to refresh cache");
    }
  }

  private async resolveLinkedRecords(
    record: any,
    processedTables: Set<string>,
    processedRecords: Set<string> = new Set(),
    processedRelationships: Set<string> = new Set()
  ): Promise<any> {
    if (processedRecords.has(record.id)) {
      return record;
    }

    processedRecords.add(record.id);
    const resolvedRecord = { ...record };

    const fieldsToResolve = new Set([
      "lessons",
      "courses",
      "sentence_structures",
      "constituents",
      "parts_of_speech",
      "tense_markers",
      "verbs",
      "pronouns",
      "determiners",
      "concrete_nouns",
      "object_markers",
    ]);

    for (const [fieldName, value] of Object.entries(record)) {
      if (!fieldsToResolve.has(fieldName)) {
        continue;
      }

      if (!value || (typeof value !== "string" && !Array.isArray(value))) {
        continue;
      }

      const sourceTable = record.__sourceTable || "unknown";
      const relationshipKey = `${sourceTable}->${fieldName}`;
      const reverseRelationshipKey = `${fieldName}->${sourceTable}`;

      if (
        processedRelationships.has(relationshipKey) ||
        processedRelationships.has(reverseRelationshipKey)
      ) {
        continue;
      }

      if (
        fieldName === "lessons" &&
        Array.isArray(value) &&
        value.length > 0 &&
        typeof value[0] === "string" &&
        !value[0].startsWith("rec")
      ) {
        continue;
      }

      if (typeof value === "string" && value.startsWith("rec")) {
        if (!processedTables.has(fieldName)) {
          try {
            processedTables.add(fieldName);
            await this.getRecords(fieldName);
          } catch (err) {
            continue;
          }
        }

        const linkedRecord = this.dataCache[fieldName]?.find(
          (r) => r.id === value
        );
        if (linkedRecord) {
          processedRelationships.add(relationshipKey);
          linkedRecord.__sourceTable = fieldName;

          const resolvedLinkedRecord = await this.resolveLinkedRecords(
            linkedRecord,
            processedTables,
            processedRecords,
            processedRelationships
          );

          if (resolvedLinkedRecord[sourceTable]) {
            delete resolvedLinkedRecord[sourceTable];
          }

          resolvedRecord[fieldName] = resolvedLinkedRecord;
        }
      } else if (
        Array.isArray(value) &&
        value.length > 0 &&
        typeof value[0] === "string" &&
        value[0].startsWith("rec")
      ) {
        if (!processedTables.has(fieldName)) {
          try {
            processedTables.add(fieldName);
            await this.getRecords(fieldName);
          } catch (err) {
            continue;
          }
        }

        processedRelationships.add(relationshipKey);

        resolvedRecord[fieldName] = await Promise.all(
          value.map(async (id) => {
            const linkedRecord = this.dataCache[fieldName]?.find(
              (r) => r.id === id
            );
            if (linkedRecord) {
              linkedRecord.__sourceTable = fieldName;

              const resolvedLinkedRecord = await this.resolveLinkedRecords(
                linkedRecord,
                processedTables,
                processedRecords,
                processedRelationships
              );

              if (resolvedLinkedRecord[sourceTable]) {
                delete resolvedLinkedRecord[sourceTable];
              }

              return resolvedLinkedRecord;
            }
            return null;
          })
        ).then((results) => results.filter((r) => r !== null));
      }
    }

    return resolvedRecord;
  }
}

export const db = AirtableDB.getInstance();
