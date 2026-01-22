import { Module } from "@nestjs/common";
import { AiController } from "./ai.controller";
import { AiService } from "./ai.service";
import { OidcModule } from "../oidc/oidc.module";
import { UserModule } from "src/user/user.module";

@Module({
  imports: [OidcModule, UserModule],
  controllers: [AiController],
  providers: [AiService],
})
export class AiModule {}
