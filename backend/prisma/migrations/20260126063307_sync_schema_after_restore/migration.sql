/*
  Warnings:

  - You are about to drop the `oauth_authorization_codes` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `oauth_clients` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `oauth_grants` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `oauth_interactions` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `oauth_refresh_tokens` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `oauth_sessions` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `refresh_tokens` table. If the table is not empty, all the data it contains will be lost.
  - The primary key for the `folders` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `folder_id` on the `folders` table. All the data in the column will be lost.
  - You are about to drop the column `folder_name` on the `folders` table. All the data in the column will be lost.
  - You are about to drop the column `parent_folder_id` on the `folders` table. All the data in the column will be lost.
  - You are about to alter the column `created_at` on the `folders` table. The data in that column could be lost. The data in that column will be cast from `String` to `DateTime`.
  - You are about to alter the column `created_by` on the `folders` table. The data in that column could be lost. The data in that column will be cast from `String` to `Int`.
  - You are about to alter the column `team_id` on the `folders` table. The data in that column could be lost. The data in that column will be cast from `String` to `Int`.
  - The primary key for the `links` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `link_id` on the `links` table. All the data in the column will be lost.
  - You are about to alter the column `created_at` on the `links` table. The data in that column could be lost. The data in that column will be cast from `String` to `DateTime`.
  - You are about to alter the column `created_by` on the `links` table. The data in that column could be lost. The data in that column will be cast from `String` to `Int`.
  - You are about to alter the column `folder_id` on the `links` table. The data in that column could be lost. The data in that column will be cast from `String` to `Int`.
  - You are about to alter the column `team_id` on the `links` table. The data in that column could be lost. The data in that column will be cast from `String` to `Int`.
  - You are about to drop the column `deleted_at` on the `users` table. All the data in the column will be lost.
  - You are about to drop the column `email` on the `users` table. All the data in the column will be lost.
  - You are about to drop the column `email_verified` on the `users` table. All the data in the column will be lost.
  - You are about to drop the column `marketing_consent` on the `users` table. All the data in the column will be lost.
  - You are about to drop the column `marketing_consent_at` on the `users` table. All the data in the column will be lost.
  - You are about to drop the column `password_hash` on the `users` table. All the data in the column will be lost.
  - You are about to drop the column `privacy_policy` on the `users` table. All the data in the column will be lost.
  - You are about to drop the column `privacy_policy_at` on the `users` table. All the data in the column will be lost.
  - You are about to drop the column `terms_of_service` on the `users` table. All the data in the column will be lost.
  - You are about to drop the column `terms_of_service_at` on the `users` table. All the data in the column will be lost.
  - You are about to drop the column `updated_at` on the `users` table. All the data in the column will be lost.
  - Added the required column `id` to the `folders` table without a default value. This is not possible if the table is not empty.
  - Added the required column `name` to the `folders` table without a default value. This is not possible if the table is not empty.
  - The required column `uuid` was added to the `folders` table with a prisma-level default value. This is not possible if the table is not empty. Please add this column as optional, then populate it before making it required.
  - Added the required column `id` to the `links` table without a default value. This is not possible if the table is not empty.
  - The required column `uuid` was added to the `links` table with a prisma-level default value. This is not possible if the table is not empty. Please add this column as optional, then populate it before making it required.

*/
-- DropIndex
DROP INDEX "oauth_authorization_codes_expires_at_idx";

-- DropIndex
DROP INDEX "oauth_authorization_codes_user_id_idx";

-- DropIndex
DROP INDEX "oauth_authorization_codes_client_id_idx";

-- DropIndex
DROP INDEX "oauth_grants_user_id_client_id_key";

-- DropIndex
DROP INDEX "oauth_grants_client_id_idx";

-- DropIndex
DROP INDEX "oauth_grants_user_id_idx";

-- DropIndex
DROP INDEX "oauth_interactions_expires_at_idx";

-- DropIndex
DROP INDEX "oauth_refresh_tokens_grant_id_idx";

-- DropIndex
DROP INDEX "oauth_refresh_tokens_expires_at_idx";

-- DropIndex
DROP INDEX "oauth_refresh_tokens_user_id_idx";

-- DropIndex
DROP INDEX "oauth_refresh_tokens_client_id_idx";

-- DropIndex
DROP INDEX "oauth_sessions_expires_at_idx";

-- DropIndex
DROP INDEX "oauth_sessions_user_id_idx";

-- DropIndex
DROP INDEX "refresh_tokens_user_id_idx";

-- DropIndex
DROP INDEX "refresh_tokens_uuid_key";

-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "oauth_authorization_codes";
PRAGMA foreign_keys=on;

-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "oauth_clients";
PRAGMA foreign_keys=on;

-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "oauth_grants";
PRAGMA foreign_keys=on;

-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "oauth_interactions";
PRAGMA foreign_keys=on;

-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "oauth_refresh_tokens";
PRAGMA foreign_keys=on;

-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "oauth_sessions";
PRAGMA foreign_keys=on;

-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "refresh_tokens";
PRAGMA foreign_keys=on;

-- CreateTable
CREATE TABLE "teams" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "uuid" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "team_members" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "team_id" INTEGER NOT NULL,
    "user_id" INTEGER NOT NULL,
    "role" TEXT NOT NULL DEFAULT 'member',
    "joined_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "team_members_team_id_fkey" FOREIGN KEY ("team_id") REFERENCES "teams" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "team_members_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_folders" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "uuid" TEXT NOT NULL,
    "team_id" INTEGER NOT NULL,
    "name" TEXT NOT NULL,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_by" INTEGER NOT NULL,
    CONSTRAINT "folders_team_id_fkey" FOREIGN KEY ("team_id") REFERENCES "teams" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_folders" ("created_at", "created_by", "team_id") SELECT "created_at", "created_by", "team_id" FROM "folders";
DROP TABLE "folders";
ALTER TABLE "new_folders" RENAME TO "folders";
CREATE UNIQUE INDEX "folders_uuid_key" ON "folders"("uuid");
CREATE INDEX "folders_team_id_idx" ON "folders"("team_id");
CREATE TABLE "new_links" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "uuid" TEXT NOT NULL,
    "team_id" INTEGER NOT NULL,
    "folder_id" INTEGER,
    "url" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "tags" TEXT NOT NULL,
    "summary" TEXT NOT NULL,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_by" INTEGER NOT NULL,
    CONSTRAINT "links_team_id_fkey" FOREIGN KEY ("team_id") REFERENCES "teams" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "links_folder_id_fkey" FOREIGN KEY ("folder_id") REFERENCES "folders" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_links" ("created_at", "created_by", "folder_id", "summary", "tags", "team_id", "title", "url") SELECT "created_at", "created_by", "folder_id", "summary", "tags", "team_id", "title", "url" FROM "links";
DROP TABLE "links";
ALTER TABLE "new_links" RENAME TO "links";
CREATE UNIQUE INDEX "links_uuid_key" ON "links"("uuid");
CREATE INDEX "links_team_id_idx" ON "links"("team_id");
CREATE INDEX "links_folder_id_idx" ON "links"("folder_id");
CREATE INDEX "links_created_at_idx" ON "links"("created_at");
CREATE TABLE "new_users" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "uuid" TEXT NOT NULL,
    "nickname" TEXT NOT NULL,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);
INSERT INTO "new_users" ("created_at", "id", "nickname", "uuid") SELECT "created_at", "id", "nickname", "uuid" FROM "users";
DROP TABLE "users";
ALTER TABLE "new_users" RENAME TO "users";
CREATE UNIQUE INDEX "users_uuid_key" ON "users"("uuid");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

-- CreateIndex
CREATE UNIQUE INDEX "teams_uuid_key" ON "teams"("uuid");

-- CreateIndex
CREATE INDEX "team_members_user_id_idx" ON "team_members"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "team_members_team_id_user_id_key" ON "team_members"("team_id", "user_id");
