-- CreateTable
CREATE TABLE "folders" (
    "folder_id" TEXT NOT NULL PRIMARY KEY,
    "team_id" TEXT NOT NULL,
    "folder_name" TEXT NOT NULL,
    "parent_folder_id" TEXT,
    "created_at" TEXT NOT NULL,
    "created_by" TEXT NOT NULL,
    CONSTRAINT "folders_parent_folder_id_fkey" FOREIGN KEY ("parent_folder_id") REFERENCES "folders" ("folder_id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "links" (
    "link_id" TEXT NOT NULL PRIMARY KEY,
    "team_id" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "tags" TEXT NOT NULL,
    "summary" TEXT NOT NULL,
    "created_at" TEXT NOT NULL,
    "created_by" TEXT NOT NULL,
    "folder_id" TEXT,
    CONSTRAINT "links_folder_id_fkey" FOREIGN KEY ("folder_id") REFERENCES "folders" ("folder_id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateIndex
CREATE INDEX "folders_team_id_idx" ON "folders"("team_id");

-- CreateIndex
CREATE INDEX "folders_parent_folder_id_idx" ON "folders"("parent_folder_id");

-- CreateIndex
CREATE INDEX "links_team_id_idx" ON "links"("team_id");

-- CreateIndex
CREATE INDEX "links_created_at_idx" ON "links"("created_at");

-- CreateIndex
CREATE INDEX "links_folder_id_idx" ON "links"("folder_id");
