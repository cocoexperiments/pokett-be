import { Module } from '@nestjs/common';
import { PassportModule } from '@nestjs/passport';
import { AuthService } from './auth.service';
import { MockAuthService } from './mock-auth.service';
import { AuthController } from './auth.controller';
import { StytchStrategy } from './stytch.strategy';
import { ConfigModule, ConfigService } from '@nestjs/config';

@Module({
  imports: [
    PassportModule,
    ConfigModule,
  ],
  controllers: [AuthController],
  providers: [
    {
      provide: AuthService,
      useFactory: (configService: ConfigService) => {
        const useMock = configService.get<string>('USE_MOCK_AUTH') === 'true';
        return useMock ? new MockAuthService() : new AuthService(configService);
      },
      inject: [ConfigService],
    },
    StytchStrategy,
  ],
  exports: [AuthService],
})
export class AuthModule {} 