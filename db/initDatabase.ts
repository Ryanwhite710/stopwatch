import * as SQLite from 'expo-sqlite';



let db: SQLite.SQLiteDatabase | null = null;
export const dbName = "time_studies.db";

const createTimeStudiesTable = `
  CREATE TABLE IF NOT EXISTS process_times (
    id INTEGER NOT NULL AUTOINCREMENT, 
    process_name TEXT,
    process_step TEXT,
    time TEXT,
    note TEXT
);`;

export const getDB = async () => {
  if (db) {
    return db;
  }

  db = await SQLite.openDatabaseAsync(dbName);

  await db.withTransactionAsync(async () => {
    if (!db) {
      return;
    }
    await db.execAsync(createTimeStudiesTable);
  });

  return db;
};
