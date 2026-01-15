/*
  Warnings:

  - You are about to drop the `oauth_authorization_codes` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `oauth_grants` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `oauth_interactions` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `oauth_refresh_tokens` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `oauth_sessions` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "oauth_authorization_codes";
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

-- CreateTable
CREATE TABLE "oidc_entities" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "type" TEXT NOT NULL,
    "payload" JSONB NOT NULL,
    "expiresAt" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateIndex
CREATE INDEX "oidc_entities_type_idx" ON "oidc_entities"("type");

-- CreateIndex
CREATE INDEX "oidc_entities_expiresAt_idx" ON "oidc_entities"("expiresAt");
