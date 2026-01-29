-- CreateTable
CREATE TABLE "team_token_usage" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "date" TEXT NOT NULL,
    "used_tokens" INTEGER NOT NULL DEFAULT 0,
    "max_tokens" INTEGER NOT NULL DEFAULT 50000,
    "team_id" INTEGER NOT NULL,
    CONSTRAINT "team_token_usage_team_id_fkey" FOREIGN KEY ("team_id") REFERENCES "teams" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE INDEX "team_token_usage_team_id_idx" ON "team_token_usage"("team_id");

-- CreateIndex
CREATE UNIQUE INDEX "team_token_usage_team_id_date_key" ON "team_token_usage"("team_id", "date");
