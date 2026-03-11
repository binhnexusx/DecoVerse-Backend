import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { passportJwtSecret } from 'jwks-rsa';
import { PrismaService } from 'src/prisma/prisma.service'; 
import { JwtPayload } from '@supabase/supabase-js';
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
    const { sub, email, name } = payload;

    let user = await this.prisma.user.findUnique({
      where: { auth0Id: sub },
    });

    if (!user) {
      user = await this.prisma.user.create({
        data: {
          auth0Id: sub,
          email: email || '',
          name: name || 'New Designer',
        },
      });
    }
    return user; 
  }
}
