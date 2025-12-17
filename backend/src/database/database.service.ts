import { Injectable, OnModuleInit, OnModuleDestroy } from "@nestjs/common";
import Database from "better-sqlite3";
import * as path from "path";
import * as fs from "fs";

@Injectable()
export class DatabaseService implements OnModuleInit, OnModuleDestroy {
  private db: Database.Database;

  constructor() {}

  onModuleInit() {
    this.initializeDatabase();
  }

  onModuleDestroy() {
    if (this.db) {
      this.db.close();
    }
  }

  private initializeDatabase(): void {
    const dataDir = path.resolve(process.cwd(), "data");
    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir, { recursive: true });
    }

    // SQLite DB 파일 경로 (data/links.db)
    const dbPath = path.join(dataDir, "links.db");

    this.db = new Database(dbPath);

    this.createTables();
  }

  private createTables(): void {
    const createLinksTable = `
      CREATE TABLE IF NOT EXISTS links (
        link_id TEXT PRIMARY KEY,
        team_id TEXT NOT NULL,
        url TEXT NOT NULL,
        title TEXT NOT NULL,
        tags TEXT NOT NULL,
        summary TEXT NOT NULL,
        created_at TEXT NOT NULL,
        created_by TEXT NOT NULL
      )
    `;

    this.db.exec(createLinksTable);

    // 인덱스
    this.db.exec("CREATE INDEX IF NOT EXISTS idx_team_id ON links(team_id)");
    this.db.exec("CREATE INDEX IF NOT EXISTS idx_created_at ON links(created_at)");
  }

  getDatabase(): Database.Database {
    return this.db;
  }
}
