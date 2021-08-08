import { MemberService } from './member.service';
import { Controller, Get, HttpStatus, Injectable, Res } from '@nestjs/common';
import { Response } from 'express';

@Controller('member')
export class MemberController {
  constructor(private readonly memberService: MemberService) {}

  @Get('/ladder')
  async findAllOrderByLadder(@Res() response: Response) {
    response.status(HttpStatus.OK);
    response.send(await this.memberService.findAllOrderByLadderScore());
  }
}
