import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { GameModule } from './modules/game/game.module';
import { GameResult } from './modules/entity/GameResult.entity';

@Module({
  imports: [GameModule, TypeOrmModule.forRootAsync({
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
        logging:true
      }),
    })],
  // providers: [ChatGateway, PongGateway],
  // providers: [PongGateway, PongService],
})
export class AppModule {}
