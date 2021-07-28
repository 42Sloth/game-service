import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { UsersModule } from '../users/users.module';
import { AuthGuard, PassportModule } from '@nestjs/passport';
import { LocalStrategy } from './local.strategy';
import { FortyTwoStrategy } from './FortyTwo.strategy';
import { AuthController } from './auth.controller';
import { SessionSerializer } from './session.serializer';
import { HandlebarsAdapter } from '@nestjs-modules/mailer/dist/adapters/handlebars.adapter';
import { config } from 'dotenv';
import { MailerModule } from '@nestjs-modules/mailer';
import { MemberModule } from '../member/member.module';

config();

@Module({
  providers: [AuthService, LocalStrategy, FortyTwoStrategy, SessionSerializer],
  imports: [
    MemberModule,
    UsersModule,
    PassportModule.register({
      session: true,
    }),
    MailerModule.forRoot({
      transport: {
        service: 'gmail',
        host: 'smtp.gmail.com',
        port: 587,
        secure: false,
        requireTLS: true,
        auth: {
          user: process.env.EMAIL_ID,
          pass: process.env.EMAIL_PASS,
        },
      },

      template: {
        dir: process.cwd() + '/template/',
        adapter: new HandlebarsAdapter(), // or new PugAdapter()
        options: {
          strict: true,
        },
      },
    }),
  ],
  exports: [AuthService],
  controllers: [AuthController],
})
export class AuthModule {}
