import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { OAuthModule } from './oauth/oauth.module';
import { WellKnownController } from './well-known.controller';

@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath: '.env.development',
      isGlobal: true,
    }),
    OAuthModule,
  ],
  controllers: [WellKnownController],
  providers: [],
})
export class AppModule {}
