-- CreateTable
CREATE TABLE "oauth_apps" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "uuid" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "client_id" TEXT NOT NULL,
    "redirect_uris" TEXT NOT NULL,
    "scopes" TEXT NOT NULL DEFAULT 'openid profile links:read',
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "authentik_provider_id" INTEGER NOT NULL,
    "authentik_app_id" TEXT NOT NULL,
    "issuer" TEXT NOT NULL DEFAULT 'https://auth.localhost/application/o/teamstash/',
    "jwks_url" TEXT NOT NULL DEFAULT 'https://auth.localhost/application/o/teamstash/jwks/',
    "owner_id" INTEGER NOT NULL,
    CONSTRAINT "oauth_apps_owner_id_fkey" FOREIGN KEY ("owner_id") REFERENCES "users" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "oauth_apps_uuid_key" ON "oauth_apps"("uuid");

-- CreateIndex
CREATE UNIQUE INDEX "oauth_apps_client_id_key" ON "oauth_apps"("client_id");

-- CreateIndex
CREATE UNIQUE INDEX "oauth_apps_authentik_provider_id_key" ON "oauth_apps"("authentik_provider_id");

-- CreateIndex
CREATE UNIQUE INDEX "oauth_apps_authentik_app_id_key" ON "oauth_apps"("authentik_app_id");

-- CreateIndex
CREATE INDEX "oauth_apps_owner_id_idx" ON "oauth_apps"("owner_id");

-- CreateIndex
CREATE INDEX "oauth_apps_issuer_idx" ON "oauth_apps"("issuer");
