import { Module } from '@nestjs/common';
import { PassportModule } from '@nestjs/passport';
import { AuthService } from './auth.service';
import { MockAuthService } from './mock-auth.service';
import { AuthController } from './auth.controller';
import { StytchStrategy } from './stytch.strategy';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { UsersModule } from '../users/users.module';
import { UsersService } from '../users/users.service';

@Module({
  imports: [
    PassportModule,
    ConfigModule,
    UsersModule,
  ],
  controllers: [AuthController],
  providers: [
    {
      provide: AuthService,
      useFactory: (configService: ConfigService, usersService: UsersService) => {
        const useMock = configService.get<string>('USE_MOCK_AUTH') === 'true';
        return useMock ? new MockAuthService() : new AuthService(configService, usersService);
      },
      inject: [ConfigService, UsersService],
    },
    StytchStrategy,
  ],
  exports: [AuthService],
})
export class AuthModule {} 