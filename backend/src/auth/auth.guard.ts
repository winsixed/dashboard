import { Injectable, CanActivate, ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(private jwt: JwtService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const authHeader = request.headers['authorization'] || request.headers['Authorization'];
    if (!authHeader) {
      throw new UnauthorizedException();
    }
    const [type, token] = (authHeader as string).split(' ');
    if (type !== 'Bearer' || !token) {
      throw new UnauthorizedException();
    }
    try {
      const decoded = await this.jwt.verifyAsync(token);
      request.user = decoded;
      return true;
    } catch {
      throw new UnauthorizedException();
    }
  }
}
