import { AuthenticatedGuard } from './auth/authenticated.guard';
import { Controller, Request, Response, Post, UseGuards, Get, Req, Res, HttpStatus } from '@nestjs/common';
import { AppService } from './app.service';
import { LocalAuthGuard } from './auth/local-auth.guard';
import { AuthService } from './auth/auth.service';
import { AuthGuard } from '@nestjs/passport/dist/auth.guard';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService, private authService: AuthService) {}

  @UseGuards(LocalAuthGuard)
  @Post('auth/login')
  async login(@Request() req) {
    console.log('[LOG] (app.controller.ts) login()');
    return this.authService.login(req.user);
  }

  @UseGuards(AuthenticatedGuard)
  @Get('profile')
  getProfile(@Request() req, @Response() res) {
    console.log('[LOG] (app.controller.ts) getProfile()');
    console.log(req.user);
    res.send(req.user);
  }
}
