import { Database } from 'sql.js';
import { getDb, saveDb } from '../index';

export class BaseRepository {
  protected async getDb(): Promise<Database> {
    return getDb();
  }

  protected async exec(sql: string, params: any[] = []): Promise<void> {
    if (!sql.trim()) {
      throw new Error('Empty SQL statement');
    }

    const db = await this.getDb();
    const validParams = Array.isArray(params) 
      ? params.map(p => p === undefined ? null : p)
      : [];

    try {
      db.run(sql, validParams);
    } catch (error) {
      console.error('SQL execution error:', { sql, params, error });
      throw error;
    }
  }

  protected async query<T>(sql: string, params: any[] = []): Promise<T[]> {
    if (!sql.trim()) {
      throw new Error('Empty SQL query');
    }

    const db = await this.getDb();
    const validParams = Array.isArray(params)
      ? params.map(p => p === undefined ? null : p)
      : [];

    try {
      const result = db.exec(sql, validParams);
      if (!result.length) return [];

      const columns = result[0].columns;
      return result[0].values.map(row => {
        const obj: any = {};
        columns.forEach((col, idx) => {
          obj[this.toCamelCase(col)] = row[idx];
        });
        return obj as T;
      });
    } catch (error) {
      console.error('Query error:', { sql, params, error });
      throw error;
    }
  }

  protected async queryOne<T>(sql: string, params: any[] = []): Promise<T | undefined> {
    const results = await this.query<T>(sql, params);
    return results[0];
  }

  private toCamelCase(str: string): string {
    return str.toLowerCase().replace(/_([a-z])/g, g => g[1].toUpperCase());
  }
}