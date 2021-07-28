import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { GameModule } from './modules/game/game.module';
import { GameResult } from './modules/entity/game-result.entity';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { FileModule } from './common/file/file.module';
import { MemberModule } from './member/member.module';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { MemberService } from './member/member.service';
import { FortyTwoGuard } from './auth/FortyTwo.guard';

@Module({
  imports: [
    AuthModule,
    UsersModule,
    FileModule,
    MemberModule,
    GameModule,
    TypeOrmModule.forRootAsync({
      useFactory: async () => ({
        type: 'postgres',
        host: process.env.POSTGRES_IP,
        port: +process.env.POSTGRES_PORT,
        username: process.env.POSTGRES_USER,
        password: process.env.POSTGRES_PASSWORD,
        database: process.env.POSTGRES_DB,
        autoLoadEntities: true,
        entities: [GameResult],
        synchronize: true,
        logging: true,
      }),
    }),
  ],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: MemberService,
      useClass: FortyTwoGuard,
    },
  ],
})
export class AppModule {}
