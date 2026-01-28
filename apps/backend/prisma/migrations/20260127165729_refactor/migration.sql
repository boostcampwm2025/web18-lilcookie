/*
  Warnings:

  - You are about to drop the `team_members` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the column `updated_at` on the `teams` table. All the data in the column will be lost.
  - Made the column `folder_id` on table `links` required. This step will fail if there are existing NULL values in that column.

*/
-- DropIndex
DROP INDEX "team_members_team_id_user_id_key";

-- DropIndex
DROP INDEX "team_members_user_id_idx";

-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "team_members";
PRAGMA foreign_keys=on;

-- CreateTable
CREATE TABLE "members" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "role" TEXT NOT NULL DEFAULT 'member',
    "joined_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "team_id" INTEGER NOT NULL,
    "user_id" INTEGER NOT NULL,
    CONSTRAINT "members_team_id_fkey" FOREIGN KEY ("team_id") REFERENCES "teams" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "members_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_folders" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "uuid" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "team_id" INTEGER NOT NULL,
    "created_by" INTEGER NOT NULL,
    CONSTRAINT "folders_team_id_fkey" FOREIGN KEY ("team_id") REFERENCES "teams" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "folders_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "users" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_folders" ("created_at", "created_by", "id", "name", "team_id", "uuid") SELECT "created_at", "created_by", "id", "name", "team_id", "uuid" FROM "folders";
DROP TABLE "folders";
ALTER TABLE "new_folders" RENAME TO "folders";
CREATE UNIQUE INDEX "folders_uuid_key" ON "folders"("uuid");
CREATE INDEX "folders_team_id_idx" ON "folders"("team_id");
CREATE INDEX "folders_created_by_idx" ON "folders"("created_by");
CREATE TABLE "new_links" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "uuid" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "summary" TEXT NOT NULL,
    "tags" TEXT NOT NULL,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "team_id" INTEGER NOT NULL,
    "folder_id" INTEGER NOT NULL,
    "created_by" INTEGER NOT NULL,
    CONSTRAINT "links_team_id_fkey" FOREIGN KEY ("team_id") REFERENCES "teams" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "links_folder_id_fkey" FOREIGN KEY ("folder_id") REFERENCES "folders" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "links_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "users" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_links" ("created_at", "created_by", "folder_id", "id", "summary", "tags", "team_id", "title", "url", "uuid") SELECT "created_at", "created_by", "folder_id", "id", "summary", "tags", "team_id", "title", "url", "uuid" FROM "links";
DROP TABLE "links";
ALTER TABLE "new_links" RENAME TO "links";
CREATE UNIQUE INDEX "links_uuid_key" ON "links"("uuid");
CREATE INDEX "links_team_id_idx" ON "links"("team_id");
CREATE INDEX "links_folder_id_idx" ON "links"("folder_id");
CREATE INDEX "links_created_by_idx" ON "links"("created_by");
CREATE TABLE "new_teams" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "uuid" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);
INSERT INTO "new_teams" ("created_at", "id", "name", "uuid") SELECT "created_at", "id", "name", "uuid" FROM "teams";
DROP TABLE "teams";
ALTER TABLE "new_teams" RENAME TO "teams";
CREATE UNIQUE INDEX "teams_uuid_key" ON "teams"("uuid");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

-- CreateIndex
CREATE INDEX "members_user_id_idx" ON "members"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "members_team_id_user_id_key" ON "members"("team_id", "user_id");
