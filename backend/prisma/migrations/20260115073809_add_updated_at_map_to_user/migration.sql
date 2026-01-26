/*
  Warnings:

  - You are about to drop the column `revoked` on the `oauth_refresh_tokens` table. All the data in the column will be lost.
  - Added the required column `updated_at` to the `users` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "oauth_grants" ADD COLUMN "revoked_at" DATETIME;

-- AlterTable
ALTER TABLE "oauth_sessions" ADD COLUMN "revoked_at" DATETIME;

-- AlterTable
ALTER TABLE "refresh_tokens" ADD COLUMN "revoked_at" DATETIME;

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_oauth_refresh_tokens" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "client_id" TEXT NOT NULL,
    "user_id" INTEGER NOT NULL,
    "scope" TEXT NOT NULL,
    "grant_id" TEXT,
    "expires_at" DATETIME NOT NULL,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "revoked_at" DATETIME,
    CONSTRAINT "oauth_refresh_tokens_client_id_fkey" FOREIGN KEY ("client_id") REFERENCES "oauth_clients" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "oauth_refresh_tokens_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "oauth_refresh_tokens_grant_id_fkey" FOREIGN KEY ("grant_id") REFERENCES "oauth_grants" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_oauth_refresh_tokens" ("client_id", "created_at", "expires_at", "grant_id", "id", "revoked_at", "scope", "user_id") SELECT "client_id", "created_at", "expires_at", "grant_id", "id", "revoked_at", "scope", "user_id" FROM "oauth_refresh_tokens";
DROP TABLE "oauth_refresh_tokens";
ALTER TABLE "new_oauth_refresh_tokens" RENAME TO "oauth_refresh_tokens";
CREATE INDEX "oauth_refresh_tokens_client_id_idx" ON "oauth_refresh_tokens"("client_id");
CREATE INDEX "oauth_refresh_tokens_user_id_idx" ON "oauth_refresh_tokens"("user_id");
CREATE INDEX "oauth_refresh_tokens_expires_at_idx" ON "oauth_refresh_tokens"("expires_at");
CREATE INDEX "oauth_refresh_tokens_grant_id_idx" ON "oauth_refresh_tokens"("grant_id");
CREATE TABLE "new_users" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "uuid" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "email_verified" BOOLEAN NOT NULL DEFAULT false,
    "nickname" TEXT NOT NULL,
    "password_hash" TEXT NOT NULL,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL,
    "deleted_at" DATETIME,
    "terms_of_service" BOOLEAN NOT NULL,
    "privacy_policy" BOOLEAN NOT NULL,
    "marketing_consent" BOOLEAN NOT NULL,
    "terms_of_service_at" DATETIME NOT NULL,
    "privacy_policy_at" DATETIME NOT NULL,
    "marketing_consent_at" DATETIME
);
INSERT INTO "new_users" ("created_at", "email", "id", "marketing_consent", "marketing_consent_at", "nickname", "password_hash", "privacy_policy", "privacy_policy_at", "terms_of_service", "terms_of_service_at", "uuid") SELECT "created_at", "email", "id", "marketing_consent", "marketing_consent_at", "nickname", "password_hash", "privacy_policy", "privacy_policy_at", "terms_of_service", "terms_of_service_at", "uuid" FROM "users";
DROP TABLE "users";
ALTER TABLE "new_users" RENAME TO "users";
CREATE UNIQUE INDEX "users_uuid_key" ON "users"("uuid");
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
