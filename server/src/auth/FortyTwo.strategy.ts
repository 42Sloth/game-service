import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy, VerifyCallback } from 'passport-42';
import { config } from 'dotenv';

config();

@Injectable()
export class FortyTwoStrategy extends PassportStrategy(Strategy, 'forty-two') {
  constructor() {
    console.log('[LOG] (FortyTwo.strategy.ts) FortyTwoStrategy.constructor()');
    super({
      clientID: process.env.FORTYTWO_CLIENT_ID,
      clientSecret: process.env.FORTYTWO_SECRET,
      callbackURL: 'http://localhost:8000/42/redirect',
    });
  }

  async validate(accessToken: string, refreshToken: string, profile: any, done: VerifyCallback): Promise<any> {
    const { username, name, emails, photos, url } = profile;
    const user = {
      id: username,
      email: emails[0].value,
      firstName: name.givenName,
      lastName: name.familyName,
      picture: photos[0].value,
      accessToken,
    };
    console.log('[LOG] (FortyTwo.strategy.ts) FortyTwoStrategy.validate()');

    done(null, user);
  }
}
