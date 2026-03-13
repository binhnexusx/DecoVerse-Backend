import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { passportJwtSecret } from 'jwks-rsa';
import { PrismaService } from 'src/prisma/prisma.service';

interface JwtPayload {
  sub: string;
  email?: string;
  name?: string;
  'https://decoverse.com/email'?: string;
}

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private prisma: PrismaService) {
    super({
      secretOrKeyProvider: passportJwtSecret({
        cache: true,
        rateLimit: true,
        jwksRequestsPerMinute: 5,
        jwksUri: `https://dev-t1qc0rb43r2wkzr4.us.auth0.com/.well-known/jwks.json`,
      }),
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      audience: 'https://api.decoverse.com',
      issuer: 'https://dev-t1qc0rb43r2wkzr4.us.auth0.com/',
      algorithms: ['RS256'],
    });
  }

  async validate(payload: JwtPayload) {
    const auth0Id = payload.sub;
    const email = payload.email || payload['https://decoverse.com/email'];

    let user = await this.prisma.user.findUnique({
      where: { auth0Id: auth0Id },
    });

    if (!user) {
      user = await this.prisma.user.create({
        data: {
          auth0Id: auth0Id,
          email: email || `user_${auth0Id}@decoverse.com`,
          name: payload.name || 'New Designer',
        },
      });
    }
    return user;
  }
}
