import { Module, Global } from "@nestjs/common";
import { DatabaseService } from "./database.service";

@Global() // 전역 모듈
@Module({
  providers: [DatabaseService],
  exports: [DatabaseService],
})
export class DatabaseModule {}
