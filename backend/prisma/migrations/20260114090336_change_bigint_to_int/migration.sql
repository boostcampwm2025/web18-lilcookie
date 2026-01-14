/*
  Warnings:

  - The primary key for the `refresh_tokens` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to alter the column `id` on the `refresh_tokens` table. The data in that column could be lost. The data in that column will be cast from `BigInt` to `Int`.
  - You are about to alter the column `user_id` on the `refresh_tokens` table. The data in that column could be lost. The data in that column will be cast from `BigInt` to `Int`.
  - The primary key for the `users` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to alter the column `id` on the `users` table. The data in that column could be lost. The data in that column will be cast from `BigInt` to `Int`.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_refresh_tokens" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "user_id" INTEGER NOT NULL,
    "token_hash" TEXT NOT NULL,
    "expires_at" DATETIME NOT NULL,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "refresh_tokens_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_refresh_tokens" ("created_at", "expires_at", "id", "token_hash", "user_id") SELECT "created_at", "expires_at", "id", "token_hash", "user_id" FROM "refresh_tokens";
DROP TABLE "refresh_tokens";
ALTER TABLE "new_refresh_tokens" RENAME TO "refresh_tokens";
CREATE INDEX "refresh_tokens_user_id_idx" ON "refresh_tokens"("user_id");
CREATE TABLE "new_users" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "uuid" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "nickname" TEXT NOT NULL,
    "password_hash" TEXT NOT NULL,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
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
