import { Injectable, Guard } from '@nitrostack/core';

@Injectable()
export class JwtGuard implements Guard {
  async canActivate(): Promise<boolean> {
    // ponytail: OAuth middleware not wired up — guard always passes.
    // Upgrade: enable OAuthModule and validate real JWTs.
    return true;
  }

}
