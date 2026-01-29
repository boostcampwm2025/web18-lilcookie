import { Module } from "@nestjs/common";
import { HttpModule } from "@nestjs/axios";
import { WebhooksController } from "./webhooks.controller";
import { WebhooksService } from "./webhooks.service";
import { WebhookRepository } from "./repositories/webhook.repository";
import { WebhookNotificationService } from "./notification/webhook-notification.service";
import { DatabaseModule } from "../database/database.module";
import { OidcModule } from "../oidc/oidc.module";
import { TeamsModule } from "../teams/teams.module";
import { UserModule } from "../user/user.module";

@Module({
  imports: [
    DatabaseModule,
    OidcModule,
    TeamsModule,
    UserModule,
    HttpModule.register({
      maxRedirects: 5,
    }),
  ],
  controllers: [WebhooksController],
  providers: [WebhooksService, WebhookRepository, WebhookNotificationService],
  exports: [WebhookRepository, WebhookNotificationService],
})
export class WebhooksModule {}
