import { MemberService } from './member.service';
import { Controller, Get, Injectable } from '@nestjs/common';

@Controller('member')
export class MemberController {
  constructor(private readonly memberService: MemberService) {}
}
