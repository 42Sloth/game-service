import { Controller, Get, Req, Res, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { AuthService } from './auth.service';
import { FortyTwoGuard } from './FortyTwo.guard';
import { AuthenticatedGuard } from './authenticated.guard';

@Controller('42')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Get()
  @UseGuards(FortyTwoGuard)
  async fortytwoAuth(@Req() req) {
    console.log('[LOG] (auth.controller.ts) fortytwoAuth');
    return null;
  }

  @Get('redirect')
  @UseGuards(FortyTwoGuard)
  fortytwoAuthRedirect(@Req() req, @Res() res) {
    console.log('[LOG] (auth.controller.ts) fortytwoAuthRedirect');
    return this.authService.fortytwoLogin(req, res);
    // res.send(this.authService.fortytwoLogin(req));
  }

  @Get('test')
  @UseGuards(AuthenticatedGuard)
  test(@Req() req) {
    return null;
  }

  @Get('email')
  sendMail(): any {
    return this.authService.sendMail('kangjm2@naver.com');
  }

  // @Get('logout')
  // logout() {
  //   console.log('logout');
  // }
}
