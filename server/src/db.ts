import initSqlJs, { Database as SqlJsDatabase } from 'sql.js';
import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';

dotenv.config({ path: path.resolve(__dirname, '../../.env') });

// Always resolve database file path relative to project root
const defaultDbPath = path.resolve(__dirname, '../../database/skill_intelligence.db');
const dbPath = process.env.DATABASE_FILE ? path.resolve(__dirname, '../../', process.env.DATABASE_FILE) : defaultDbPath;
const dbDir = path.dirname(dbPath);

if (!fs.existsSync(dbDir)) {
  fs.mkdirSync(dbDir, { recursive: true });
}

let rawDb: SqlJsDatabase | null = null;

function saveDb() {
  if (rawDb) {
    const data = rawDb.export();
    const buffer = Buffer.from(data);
    fs.writeFileSync(dbPath, buffer);
  }
}

export const db = {
  prepare(sql: string) {
    return {
      get(...params: any[]) {
        if (!rawDb) return null;
        try {
          const stmt = rawDb.prepare(sql);
          stmt.bind(params.flat());
          if (stmt.step()) {
            const row = stmt.getAsObject();
            stmt.free();
            return row;
          }
          stmt.free();
          return undefined;
        } catch (e: any) {
          return undefined;
        }
      },
      all(...params: any[]) {
        if (!rawDb) return [];
        try {
          const stmt = rawDb.prepare(sql);
          stmt.bind(params.flat());
          const results: any[] = [];
          while (stmt.step()) {
            results.push(stmt.getAsObject());
          }
          stmt.free();
          return results;
        } catch (e: any) {
          return [];
        }
      },
      run(...params: any[]) {
        if (!rawDb) return { changes: 0 };
        try {
          rawDb.run(sql, params.flat());
          saveDb();
          return { changes: rawDb.getRowsModified() };
        } catch (e: any) {
          return { changes: 0 };
        }
      }
    };
  },
  exec(sql: string) {
    if (rawDb) {
      const cleanSql = sql.replace(/FOREIGN KEY REFERENCES [^\s,\)]+/gi, '');
      rawDb.exec(cleanSql);
      saveDb();
    }
  }
};

export async function initDB() {
  if (rawDb) return;
  const SQL = await initSqlJs();

  if (fs.existsSync(dbPath)) {
    const filebuffer = fs.readFileSync(dbPath);
    rawDb = new SQL.Database(filebuffer);
  } else {
    rawDb = new SQL.Database();
  }

  const schemaPath = path.resolve(__dirname, '../../database/schema.sql');
  if (fs.existsSync(schemaPath)) {
    const schemaSql = fs.readFileSync(schemaPath, 'utf-8');
    db.exec(schemaSql);
  }
}
