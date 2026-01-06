import { Module } from "@nestjs/common";
import { HttpModule } from "@nestjs/axios";
import { NotificationService } from "./notification.service";

@Module({
  imports: [
    HttpModule.register({
      timeout: 5000,
      maxRedirects: 5,
    }),
  ],
  providers: [NotificationService],
  exports: [NotificationService],
})
export class NotificationModule {}
