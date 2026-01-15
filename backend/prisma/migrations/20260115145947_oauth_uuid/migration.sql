/*
  Warnings:

  - You are about to drop the column `user_id` on the `oauth_authorization_codes` table. All the data in the column will be lost.
  - You are about to drop the column `user_id` on the `oauth_grants` table. All the data in the column will be lost.
  - You are about to drop the column `user_id` on the `oauth_refresh_tokens` table. All the data in the column will be lost.
  - You are about to drop the column `user_id` on the `oauth_sessions` table. All the data in the column will be lost.
  - Added the required column `user_uuid` to the `oauth_authorization_codes` table without a default value. This is not possible if the table is not empty.
  - Added the required column `user_uuid` to the `oauth_grants` table without a default value. This is not possible if the table is not empty.
  - Added the required column `user_uuid` to the `oauth_refresh_tokens` table without a default value. This is not possible if the table is not empty.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_oauth_authorization_codes" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "client_id" TEXT NOT NULL,
    "user_uuid" TEXT NOT NULL,
    "redirect_uri" TEXT NOT NULL,
    "scope" TEXT NOT NULL,
    "code_challenge" TEXT,
    "code_challenge_method" TEXT,
    "expires_at" DATETIME NOT NULL,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "consumed" BOOLEAN NOT NULL DEFAULT false,
    "consumed_at" DATETIME,
    CONSTRAINT "oauth_authorization_codes_client_id_fkey" FOREIGN KEY ("client_id") REFERENCES "oauth_clients" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "oauth_authorization_codes_user_uuid_fkey" FOREIGN KEY ("user_uuid") REFERENCES "users" ("uuid") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_oauth_authorization_codes" ("client_id", "code_challenge", "code_challenge_method", "consumed", "consumed_at", "created_at", "expires_at", "id", "redirect_uri", "scope") SELECT "client_id", "code_challenge", "code_challenge_method", "consumed", "consumed_at", "created_at", "expires_at", "id", "redirect_uri", "scope" FROM "oauth_authorization_codes";
DROP TABLE "oauth_authorization_codes";
ALTER TABLE "new_oauth_authorization_codes" RENAME TO "oauth_authorization_codes";
CREATE INDEX "oauth_authorization_codes_client_id_idx" ON "oauth_authorization_codes"("client_id");
CREATE INDEX "oauth_authorization_codes_user_uuid_idx" ON "oauth_authorization_codes"("user_uuid");
CREATE INDEX "oauth_authorization_codes_expires_at_idx" ON "oauth_authorization_codes"("expires_at");
CREATE TABLE "new_oauth_grants" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "user_uuid" TEXT NOT NULL,
    "client_id" TEXT NOT NULL,
    "scope" TEXT NOT NULL,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL,
    "revoked_at" DATETIME,
    CONSTRAINT "oauth_grants_user_uuid_fkey" FOREIGN KEY ("user_uuid") REFERENCES "users" ("uuid") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "oauth_grants_client_id_fkey" FOREIGN KEY ("client_id") REFERENCES "oauth_clients" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_oauth_grants" ("client_id", "created_at", "id", "revoked_at", "scope", "updated_at") SELECT "client_id", "created_at", "id", "revoked_at", "scope", "updated_at" FROM "oauth_grants";
DROP TABLE "oauth_grants";
ALTER TABLE "new_oauth_grants" RENAME TO "oauth_grants";
CREATE INDEX "oauth_grants_user_uuid_idx" ON "oauth_grants"("user_uuid");
CREATE INDEX "oauth_grants_client_id_idx" ON "oauth_grants"("client_id");
CREATE UNIQUE INDEX "oauth_grants_user_uuid_client_id_key" ON "oauth_grants"("user_uuid", "client_id");
CREATE TABLE "new_oauth_refresh_tokens" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "client_id" TEXT NOT NULL,
    "user_uuid" TEXT NOT NULL,
    "scope" TEXT NOT NULL,
    "grant_id" TEXT,
    "expires_at" DATETIME NOT NULL,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "revoked_at" DATETIME,
    CONSTRAINT "oauth_refresh_tokens_client_id_fkey" FOREIGN KEY ("client_id") REFERENCES "oauth_clients" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "oauth_refresh_tokens_user_uuid_fkey" FOREIGN KEY ("user_uuid") REFERENCES "users" ("uuid") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "oauth_refresh_tokens_grant_id_fkey" FOREIGN KEY ("grant_id") REFERENCES "oauth_grants" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_oauth_refresh_tokens" ("client_id", "created_at", "expires_at", "grant_id", "id", "revoked_at", "scope") SELECT "client_id", "created_at", "expires_at", "grant_id", "id", "revoked_at", "scope" FROM "oauth_refresh_tokens";
DROP TABLE "oauth_refresh_tokens";
ALTER TABLE "new_oauth_refresh_tokens" RENAME TO "oauth_refresh_tokens";
CREATE INDEX "oauth_refresh_tokens_client_id_idx" ON "oauth_refresh_tokens"("client_id");
CREATE INDEX "oauth_refresh_tokens_user_uuid_idx" ON "oauth_refresh_tokens"("user_uuid");
CREATE INDEX "oauth_refresh_tokens_expires_at_idx" ON "oauth_refresh_tokens"("expires_at");
CREATE INDEX "oauth_refresh_tokens_grant_id_idx" ON "oauth_refresh_tokens"("grant_id");
CREATE TABLE "new_oauth_sessions" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "user_uuid" TEXT,
    "payload" TEXT NOT NULL,
    "expires_at" DATETIME NOT NULL,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "revoked_at" DATETIME
);
INSERT INTO "new_oauth_sessions" ("created_at", "expires_at", "id", "payload", "revoked_at") SELECT "created_at", "expires_at", "id", "payload", "revoked_at" FROM "oauth_sessions";
DROP TABLE "oauth_sessions";
ALTER TABLE "new_oauth_sessions" RENAME TO "oauth_sessions";
CREATE INDEX "oauth_sessions_user_uuid_idx" ON "oauth_sessions"("user_uuid");
CREATE INDEX "oauth_sessions_expires_at_idx" ON "oauth_sessions"("expires_at");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
