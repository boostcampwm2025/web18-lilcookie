import { Module } from "@nestjs/common";
import { HttpModule } from "@nestjs/axios";
import { AuthentikAdminService } from "./authentik-admin.service";

@Module({
  imports: [
    HttpModule.register({
      timeout: 10000,
      maxRedirects: 5,
    }),
  ],
  providers: [AuthentikAdminService],
  exports: [AuthentikAdminService],
})
export class AuthentikAdminModule {}
