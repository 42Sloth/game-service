import { Injectable } from '@nestjs/common';
import { InjectRepository } from "@nestjs/typeorm";
import { Member } from "./member.entity";
import { Column, Repository } from "typeorm";

@Injectable()
export class MemberService {
  constructor(
    @InjectRepository(Member) private readonly memberRepository: Repository<Member>
  ) {
  }

  async createMember(data): Promise<Member> {
    return this.memberRepository.save({
      username: data.id,
      nickname: data.id,
      default_image: data.picture,
      role: "ROLE_USER"});
  }

  async getMember(username: string): Promise<Member>{
    return this.memberRepository.findOne(
        { where: [{ username: username }]}
      )
  }
}
