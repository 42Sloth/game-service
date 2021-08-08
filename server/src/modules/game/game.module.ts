import { Module } from '@nestjs/common';
import { MemberModule } from 'src/member/member.module';
import { MemberService } from 'src/member/member.service';
import { GameController } from './game.controller';
import { GameGateway } from './game.gateway';
import { GameService } from './game.service';

@Module({
  imports: [MemberModule],
  controllers: [GameController],
  providers: [GameGateway, GameService],
})
export class GameModule {}
