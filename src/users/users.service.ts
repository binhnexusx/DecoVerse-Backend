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
    return this.prisma.user.upsert({
      where: { auth0Id: userData.auth0Id },
      update: {
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
