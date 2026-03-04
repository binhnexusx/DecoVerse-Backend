import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { SyncUserDto } from './users.dto';
import { UsersService } from './users.service';
import { Body, Controller, Post, Req, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Request } from 'express';

interface RequestWithUser extends Request {
  user: {
    sub: string;
    email?: string;
    [key: string]: any;
  };
}

@ApiTags('Users')
@ApiBearerAuth()
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @UseGuards(AuthGuard('jwt'))
  @Post('sync')
  @ApiOperation({ summary: 'Synchronize user information from Auth0' })
  @ApiResponse({ status: 201, description: 'Synchronization successful' })
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
