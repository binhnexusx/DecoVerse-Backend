import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  async findOrCreateUser(userData: {
    auth0Id: string;
    email: string;
    name?: string;
  }) {
    if (!userData.auth0Id) {
      throw new Error('auth0Id is required for upsert operation');
    }

    return this.prisma.user.upsert({
      where: { email: userData.email },
      update: {
        auth0Id: userData.auth0Id,
        name: userData.name,
      },
      create: {
        auth0Id: userData.auth0Id,
        email: userData.email,
        name: userData.name,
      },
    });
  }
}
