import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { OAuthModule } from './oauth/oauth.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath: '.env.development',
      isGlobal: true,
    }),
    OAuthModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
