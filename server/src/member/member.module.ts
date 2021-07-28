import { Global, Module } from "@nestjs/common";
import { MemberService } from './member.service';
import { MemberController } from './member.controller';
import { TypeOrmModule } from "@nestjs/typeorm";
import { Member } from "./member.entity";

@Module({
  imports: [TypeOrmModule.forFeature([Member])],
  providers: [MemberService],
  controllers: [MemberController],
  exports: [MemberService]
})
export class MemberModule {}
