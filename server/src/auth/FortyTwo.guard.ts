import { CanActivate, ExecutionContext, Inject, Injectable, UnauthorizedException } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { MemberService } from '../member/member.service';

@Injectable()
export class FortyTwoGuard extends AuthGuard('forty-two') implements CanActivate {
  constructor() {
    super();
  }

  async canActivate(context: ExecutionContext): Promise<any> {
    const request = context.switchToHttp().getRequest();
    const result = await super.canActivate(context);
    await super.logIn(request);

    // await request.login();
    return result;
  }

  handleRequest(err, user, info) {
    console.log('[LOG] (FortyTwo.guard.ts) handleRequest()');

    // You can throw an exception based on either "info" or "err" arguments
    if (err || !user) {
      throw err || new UnauthorizedException();
    }
    return user;
  }
}
