import { Module } from "@nestjs/common";
import { FoldersController } from "./folders.controller";
import { FoldersService } from "./folders.service";
import { DatabaseModule } from "../database/database.module";
import { FolderRepository } from "./repositories/folder.repository";

@Module({
  imports: [DatabaseModule],
  controllers: [FoldersController],
  providers: [FoldersService, FolderRepository],
  exports: [FoldersService],
})
export class FoldersModule {}
