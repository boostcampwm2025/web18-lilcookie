-- CreateTable
CREATE TABLE "team_webhooks" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "uuid" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "team_id" INTEGER NOT NULL,
    CONSTRAINT "team_webhooks_team_id_fkey" FOREIGN KEY ("team_id") REFERENCES "teams" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "team_webhooks_uuid_key" ON "team_webhooks"("uuid");

-- CreateIndex
CREATE INDEX "team_webhooks_team_id_idx" ON "team_webhooks"("team_id");
