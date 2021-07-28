import { Injectable } from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { MailerService } from '@nestjs-modules/mailer';
import { MemberService } from '../member/member.service';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private memberService: MemberService,
    private readonly mailerService: MailerService
  ) {}

  async validateUser(username: string, pass: string): Promise<any> {
    const user = await this.usersService.findOne(username);
    if (user && user.password === pass) {
      const { password, ...result } = user;
      return result;
    }
    return null;
  }

  async login(user: any) {
    const payload = { username: user.username, sub: user.userId };

    // return {
    //   access_token: this.jwtService.sign(payload),
    // };
  }

  fortytwoLogin(req, res) {
    console.log('[LOG] (auth.service.ts) fortytwoLogin');
    if (!req.user) {
      return 'No user from 42';
    }

    this.memberService.getMember(req.user.username).then((exist) => {
      if (exist == undefined) {
        this.memberService.createMember(req.user);
      }
    });

    res.redirect('http://localhost:3001');
    // return {
    //   message: 'User information from 42',
    //   user: req.user,
    // };
  }

  async sendMail(email: string) {
    try {
      const number: number = Math.floor(100000 + Math.random() * 900000);
      await this.mailerService.sendMail({
        to: email, // list of receivers
        from: 'pind.auth@gmail.com', // sender address
        subject: '이메일 인증 요청 메일입니다.', // Subject line
        html: '6자리 인증 코드 : ' + `<b> ${number}</b>`, // HTML body content
      });
      return number;
    } catch (err) {
      console.log(err);
    }
  }
}
