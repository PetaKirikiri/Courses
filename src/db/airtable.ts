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

  private async resolveLinkedRecords(
    record: any,
    processedTables: Set<string>
  ): Promise<any> {
    const resolvedRecord = { ...record };

    for (const [fieldName, value] of Object.entries(record)) {
      // Skip non-linked fields
      if (!value || (typeof value !== "string" && !Array.isArray(value))) {
        continue;
      }

      // Handle single linked record
      if (typeof value === "string" && value.startsWith("rec")) {
        if (!processedTables.has(fieldName)) {
          processedTables.add(fieldName);
          await this.getRecords(fieldName);
        }

        const linkedRecord = this.dataCache[fieldName]?.find(
          (r) => r.id === value
        );
        if (linkedRecord) {
          resolvedRecord[fieldName] = await this.resolveLinkedRecords(
            linkedRecord,
            processedTables
          );
        }
      }
      // Handle array of linked records
      else if (
        Array.isArray(value) &&
        value.length > 0 &&
        typeof value[0] === "string" &&
        value[0].startsWith("rec")
      ) {
        if (!processedTables.has(fieldName)) {
          processedTables.add(fieldName);
          await this.getRecords(fieldName);
        }

        resolvedRecord[fieldName] = await Promise.all(
          value.map(async (id) => {
            const linkedRecord = this.dataCache[fieldName]?.find(
              (r) => r.id === id
            );
            if (linkedRecord) {
              return await this.resolveLinkedRecords(
                linkedRecord,
                processedTables
              );
            }
            return null;
          })
        );
      }
    }

    return resolvedRecord;
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
      console.error(`Failed to fetch ${tableName}:`, err);
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
}

export const db = AirtableDB.getInstance();
