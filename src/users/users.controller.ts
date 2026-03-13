import { SyncUserDto } from './users.dto';
import { UsersService } from './users.service';
import { Body, Controller, Post, Req, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @UseGuards(AuthGuard('jwt'))
  @Post('sync')
  async syncUser(@Req() req: { user: any }, @Body() body: SyncUserDto) {
    const user = req.user;
    const auth0Id = user?.sub || user?.auth0Id;
    const { email, name } = body;

    return this.usersService.findOrCreateUser({
      auth0Id: auth0Id as string,
      email,
      name,
    });
  }
}
