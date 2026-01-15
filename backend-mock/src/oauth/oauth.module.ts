import { Module } from '@nestjs/common';
import { OAuthController } from './oauth.controller';

@Module({
  controllers: [OAuthController],
})
export class OAuthModule {}
