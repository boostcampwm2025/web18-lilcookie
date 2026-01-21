import { Module } from "@nestjs/common";
import { AiController } from "./ai.controller";
import { AiService } from "./ai.service";
import { OidcModule } from "../oidc/oidc.module";

@Module({
  imports: [OidcModule],
  controllers: [AiController],
  providers: [AiService],
})
export class AiModule {}
