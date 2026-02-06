import { Controller, Post, Req, Body, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { UsersService } from './users.service';

interface SyncUserDto {
  email: string;
  name: string;
}

interface RequestWithUser extends Request {
  user: {
    sub: string;
    [key: string]: any;
  };
}

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @UseGuards(AuthGuard('jwt'))
  @Post('sync')
  async syncUser(@Req() req: RequestWithUser, @Body() body: SyncUserDto) {
    const { sub: auth0Id } = req.user;
    const { email, name } = body;

    return this.usersService.findOrCreateUser({
      auth0Id,
      email,
      name,
    });
  }
}
