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
    const createFoldersTable = `
      CREATE TABLE IF NOT EXISTS folders (
        folder_id TEXT PRIMARY KEY,
        team_id TEXT NOT NULL,
        folder_name TEXT NOT NULL,
        parent_folder_id TEXT,
        created_at TEXT NOT NULL,
        created_by TEXT NOT NULL,
        FOREIGN KEY (parent_folder_id) REFERENCES folders(folder_id) ON DELETE CASCADE
      )
    `;

    this.db.exec(createFoldersTable);

    // folders 인덱스
    this.db.exec("CREATE INDEX IF NOT EXISTS idx_folders_team_id ON folders(team_id)");
    this.db.exec("CREATE INDEX IF NOT EXISTS idx_folders_parent ON folders(parent_folder_id)");

    // links 테이블 생성
    const createLinksTable = `
      CREATE TABLE IF NOT EXISTS links (
        link_id TEXT PRIMARY KEY,
        team_id TEXT NOT NULL,
        url TEXT NOT NULL,
        title TEXT NOT NULL,
        tags TEXT NOT NULL,
        summary TEXT NOT NULL,
        created_at TEXT NOT NULL,
        created_by TEXT NOT NULL,
        folder_id TEXT,
        FOREIGN KEY (folder_id) REFERENCES folders(folder_id) ON DELETE SET NULL
      )
    `;

    this.db.exec(createLinksTable);

    // links 인덱스
    this.db.exec("CREATE INDEX IF NOT EXISTS idx_team_id ON links(team_id)");
    this.db.exec("CREATE INDEX IF NOT EXISTS idx_created_at ON links(created_at)");
    this.db.exec("CREATE INDEX IF NOT EXISTS idx_folder_id ON links(folder_id)");
  }

  getDatabase(): Database.Database {
    return this.db;
  }
}
