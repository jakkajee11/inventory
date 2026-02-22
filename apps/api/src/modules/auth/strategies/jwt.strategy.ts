import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { UserRepository } from '../user/infrastructure/user.repository';
import { User } from '../user/domain/entities/user.entity';

export interface JwtPayload {
  sub: string;
  email: string;
  companyId: string;
  roleId: string;
  iat?: number;
  exp?: number;
}

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private readonly configService: ConfigService,
    private readonly userRepository: UserRepository,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.get<string>('jwt.secret') || 'your-super-secret-key-change-in-production',
    });
  }

  async validate(payload: JwtPayload): Promise<User> {
    const user = await this.userRepository.findByIdWithPermissions(payload.sub);

    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    if (!user.isActive) {
      throw new UnauthorizedException('User account is deactivated');
    }

    if (user.deletedAt) {
      throw new UnauthorizedException('User account has been deleted');
    }

    // Verify company matches (security check for multi-tenancy)
    if (user.companyId !== payload.companyId) {
      throw new UnauthorizedException('Invalid company context');
    }

    return user;
  }
}
