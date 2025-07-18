import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../prisma.service';
import * as bcrypt from 'bcryptjs';

@Injectable()
export class AuthService {
  constructor(private prisma: PrismaService, private jwt: JwtService) {}

  async validateUser(username: string, password: string) {
    const user = await this.prisma.user.findUnique({ where: { username } });
    if (!user) {
      throw new UnauthorizedException();
    }
    const valid = await bcrypt.compare(password, user.passwordHash);
    if (!valid) {
      throw new UnauthorizedException();
    }
    return user;
  }

  async login(username: string, password: string) {
    const user = await this.validateUser(username, password);
    const payload = { id: user.id, roleId: user.roleId };
    return {
      access_token: await this.jwt.signAsync(payload),
    };
  }

  async register(data: {
    firstName: string;
    lastName: string;
    username: string;
    password: string;
    roleId: number;
  }) {
    const passwordHash = await bcrypt.hash(data.password, 10);
    const user = await this.prisma.user.create({
      data: {
        firstName: data.firstName,
        lastName: data.lastName,
        username: data.username,
        passwordHash,
        roleId: data.roleId,
      },
    });
    const payload = { id: user.id, roleId: user.roleId };
    return {
      access_token: await this.jwt.signAsync(payload),
    };
  }
}
