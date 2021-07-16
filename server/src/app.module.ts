import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PongModule } from './modules/pong/pong.module';
import { Game } from './modules/entity/Game.entity';

@Module({
  imports: [PongModule, TypeOrmModule.forRootAsync({
      useFactory: async () => ({
        type: 'postgres',
        host: process.env.POSTGRES_IP,
        port: +process.env.POSTGRES_PORT,
        username: process.env.POSTGRES_USER,
        password: process.env.POSTGRES_PASSWORD,
        database: process.env.POSTGRES_DB,
        autoLoadEntities: true,
        entities: [Game],
        synchronize: true,
        logging:true
      }),
    })],
  // providers: [ChatGateway, PongGateway],
  // providers: [PongGateway, PongService],
})
export class AppModule {}
