import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Member } from './member.entity';
import { Column, Repository } from 'typeorm';
import { MemberDto } from 'src/modules/dtos/member.dto';

@Injectable()
export class MemberService {
  constructor(@InjectRepository(Member) private readonly memberRepository: Repository<Member>) {}

  async createMember(data): Promise<Member> {
    return this.memberRepository.save({
      username: data.id,
      nickname: data.id,
      default_image: data.picture,
      role: 'ROLE_USER',
      ladder_score: 0,
    });
  }

  async getMember(username: string): Promise<Member> {
    return this.memberRepository.findOne({ where: [{ username: username }] });
  }

  // async getMemberDto(username: string): Promise<MemberDto> {
  //   return MemberDto.fromEntity(await this.memberRepository.findOne({ where: [{ username: username }] }));
  // }

  async getLadderScore(username: string): Promise<number> {
    return (await this.memberRepository.findOne({ where: [{ username: username }] })).ladder_score;
  }

  setLadderScore(username: string, ladder_score: number) {
    (async () => {
      const user: Member = await this.memberRepository.findOne({ where: [{ username: username }] });
      user.ladder_score += ladder_score;
      this.memberRepository.save(user);
    })();
    return;
  }
}
