import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Member } from './member.entity';
import { Column, Repository } from 'typeorm';
import { MemberDto } from 'src/modules/dtos/member.dto';

@Injectable()
export class MemberService {
  constructor(@InjectRepository(Member) private readonly memberRepository: Repository<Member>) {}

  async createMember(data): Promise<Member> {
    let member: Member;
    try {
      member = await this.memberRepository.save({
        username: data.id,
        nickname: data.id,
        default_image: data.picture,
        role: 'ROLE_USER',
        ladder_score: 1000,
      });
    } catch (e) {
      console.log('MemberService: createMember 에서 오류가 났습니다.');
      console.log(e.message);
      console.log(e.query);
    }
    return member;
  }

  async getMember(username: string): Promise<Member> {
    return this.memberRepository.findOne({ where: [{ username: username }] });
  }

  async getLadderScore(username: string): Promise<number> {
    return (await this.memberRepository.findOne({ where: [{ username: username }] })).ladder_score;
  }

  setLadderScore(username: string, delta: number) {
    (async () => {
      const user: Member = await this.memberRepository.findOne({ where: [{ username: username }] });
      this.memberRepository.update({ id: user.id }, { ladder_score: user.ladder_score + delta });
    })();
    return;
  }

  async findAllOrderByLadderScore(): Promise<Array<Member>> {
    return await this.memberRepository.createQueryBuilder('member').orderBy('ladder_score', 'DESC').getMany();
  }
}
