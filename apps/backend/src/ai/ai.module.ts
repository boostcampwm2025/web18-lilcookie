import { Module } from "@nestjs/common";
import { HttpModule } from "@nestjs/axios";
import { AiController } from "./ai.controller";
import { AiService } from "./ai.service";
import { OidcModule } from "../oidc/oidc.module";
import { UserModule } from "../user/user.module";

@Module({
  imports: [
    OidcModule,
    UserModule,
    HttpModule.register({
      timeout: 30000, // AI API calls may take longer
      maxRedirects: 5,
    }),
  ],
  controllers: [AiController],
  providers: [AiService],
})
export class AiModule {}
