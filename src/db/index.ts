import initSqlJs from 'sql.js';
import type { Database } from 'sql.js';
import localforage from 'localforage';

let db: Database | null = null;
let isInitializing = false;
let initPromise: Promise<Database> | null = null;

const DB_NAME = 'garden_db';
const DB_VERSION = 2; // Increment version to force schema update

export const getDb = async (): Promise<Database> => {
  if (!db) {
    if (isInitializing && initPromise) {
      return initPromise;
    }
    isInitializing = true;
    initPromise = initDatabase();
    try {
      db = await initPromise;
    } finally {
      isInitializing = false;
      initPromise = null;
    }
  }
  return db;
};

export const saveDb = async (): Promise<void> => {
  if (!db) return;
  
  const retries = 3;
  let lastError: Error | null = null;

  for (let i = 0; i < retries; i++) {
    try {
      const data = db.export();
      await localforage.setItem(`${DB_NAME}_v${DB_VERSION}`, data);
      return;
    } catch (error) {
      lastError = error instanceof Error ? error : new Error('Unknown error during save');
      if (i < retries - 1) {
        await new Promise(resolve => setTimeout(resolve, Math.pow(2, i) * 100));
        continue;
      }
    }
  }

  throw lastError || new Error('Failed to save database after multiple attempts');
};

const dropTables = (database: Database) => {
  const tables = [
    'routine_assignments',
    'routines',
    'status_history',
    'collaborators',
    'tasks',
    'sub_zones',
    'zones',
    'designations'
  ];

  for (const table of tables) {
    try {
      database.exec(`DROP TABLE IF EXISTS ${table}`);
    } catch (error) {
      console.error(`Error dropping table ${table}:`, error);
    }
  }
};

const createTables = (database: Database) => {
  database.exec(`
    CREATE TABLE IF NOT EXISTS zones (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      description TEXT,
      color TEXT NOT NULL,
      created_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS sub_zones (
      id TEXT PRIMARY KEY,
      zone_id TEXT NOT NULL,
      name TEXT NOT NULL,
      priority INTEGER NOT NULL CHECK (priority IN (1, 2, 3)),
      FOREIGN KEY (zone_id) REFERENCES zones(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS tasks (
      id TEXT PRIMARY KEY,
      zone_id TEXT,
      sub_zone_id TEXT,
      title TEXT NOT NULL,
      description TEXT,
      status TEXT NOT NULL,
      created_at TEXT NOT NULL,
      action_date TEXT NOT NULL,
      has_deadline INTEGER DEFAULT 0,
      deadline_date TEXT,
      is_routine INTEGER DEFAULT 0,
      designation_id TEXT,
      FOREIGN KEY (zone_id) REFERENCES zones(id) ON DELETE CASCADE,
      FOREIGN KEY (sub_zone_id) REFERENCES sub_zones(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS collaborators (
      id TEXT PRIMARY KEY,
      task_id TEXT NOT NULL,
      user_id TEXT NOT NULL,
      status TEXT NOT NULL,
      joined_at TEXT NOT NULL,
      started_at TEXT,
      time_spent INTEGER DEFAULT 0,
      last_status_change TEXT NOT NULL,
      FOREIGN KEY (task_id) REFERENCES tasks(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS status_history (
      id TEXT PRIMARY KEY,
      task_id TEXT NOT NULL,
      status TEXT NOT NULL,
      timestamp TEXT NOT NULL,
      user_id TEXT,
      reason TEXT,
      FOREIGN KEY (task_id) REFERENCES tasks(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS routines (
      id TEXT PRIMARY KEY,
      zone_id TEXT,
      sub_zone_id TEXT,
      title TEXT NOT NULL,
      description TEXT,
      status TEXT NOT NULL,
      created_at TEXT NOT NULL,
      frequency TEXT NOT NULL,
      custom_interval INTEGER,
      next_execution TEXT NOT NULL,
      last_execution TEXT,
      FOREIGN KEY (zone_id) REFERENCES zones(id) ON DELETE CASCADE,
      FOREIGN KEY (sub_zone_id) REFERENCES sub_zones(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS routine_assignments (
      id TEXT PRIMARY KEY,
      routine_id TEXT NOT NULL,
      user_id TEXT NOT NULL,
      FOREIGN KEY (routine_id) REFERENCES routines(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS designations (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL UNIQUE,
      created_at TEXT NOT NULL
    );
  `);
};

const createIndexes = (database: Database) => {
  const indexes = [
    'CREATE INDEX IF NOT EXISTS idx_sub_zones_zone_id ON sub_zones(zone_id)',
    'CREATE INDEX IF NOT EXISTS idx_tasks_zone_id ON tasks(zone_id)',
    'CREATE INDEX IF NOT EXISTS idx_tasks_sub_zone_id ON tasks(sub_zone_id)',
    'CREATE INDEX IF NOT EXISTS idx_tasks_status ON tasks(status)',
    'CREATE INDEX IF NOT EXISTS idx_tasks_designation_id ON tasks(designation_id)',
    'CREATE INDEX IF NOT EXISTS idx_collaborators_task_id ON collaborators(task_id)',
    'CREATE INDEX IF NOT EXISTS idx_collaborators_user_id ON collaborators(user_id)',
    'CREATE INDEX IF NOT EXISTS idx_status_history_task_id ON status_history(task_id)',
    'CREATE INDEX IF NOT EXISTS idx_routines_zone_id ON routines(zone_id)',
    'CREATE INDEX IF NOT EXISTS idx_routines_sub_zone_id ON routines(sub_zone_id)',
    'CREATE INDEX IF NOT EXISTS idx_routines_status ON routines(status)',
    'CREATE INDEX IF NOT EXISTS idx_routine_assignments_routine_id ON routine_assignments(routine_id)',
    'CREATE INDEX IF NOT EXISTS idx_routine_assignments_user_id ON routine_assignments(user_id)'
  ];

  for (const index of indexes) {
    try {
      database.exec(index);
    } catch (error) {
      console.error(`Error creating index: ${index}`, error);
    }
  }
};

const initDatabase = async (): Promise<Database> => {
  try {
    localforage.config({
      name: DB_NAME,
      storeName: 'garden_store',
      version: DB_VERSION
    });

    const SQL = await initSqlJs({
      locateFile: file => `https://sql.js.org/dist/${file}`
    });

    let savedDb: Uint8Array | null = null;
    try {
      savedDb = await localforage.getItem(`${DB_NAME}_v${DB_VERSION}`);
    } catch (error) {
      console.warn('Could not load saved database:', error);
    }

    const database = savedDb ? new SQL.Database(savedDb) : new SQL.Database();

    database.exec('PRAGMA foreign_keys = ON;');
    database.exec('PRAGMA journal_mode = WAL;');
    database.exec('PRAGMA busy_timeout = 5000;');
    database.exec('PRAGMA synchronous = NORMAL;');
    database.exec('PRAGMA cache_size = 5000;');

    try {
      database.exec('BEGIN IMMEDIATE TRANSACTION;');

      // Drop and recreate tables to ensure schema is up to date
      dropTables(database);
      createTables(database);
      createIndexes(database);

      database.exec('COMMIT;');
      
      await saveDb();
      return database;
    } catch (error) {
      console.error('Error during database initialization:', error);
      try {
        database.exec('ROLLBACK;');
      } catch (rollbackError) {
        console.error('Failed to rollback during initialization:', rollbackError);
      }
      throw error;
    }
  } catch (error) {
    console.error('Database initialization failed:', error);
    throw new Error('Failed to initialize database: ' + (error instanceof Error ? error.message : 'Unknown error'));
  }
};

export const resetDatabase = async (): Promise<void> => {
  if (db) {
    db.close();
    db = null;
  }
  await localforage.removeItem(`${DB_NAME}_v${DB_VERSION}`);
};