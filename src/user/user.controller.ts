import { Controller, Get, HttpCode, HttpStatus } from '@nestjs/common';
import { UserService } from './user.service';
import { ApiUseTags } from '@nestjs/swagger';
import { GetLeaderboardResponse } from '../contract';

@ApiUseTags('user')
@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get('leaderboard')
  @HttpCode(HttpStatus.OK)
  async getTopUsers(): Promise<GetLeaderboardResponse> {
    return await this.userService.getLeaderBoard(20);
  }
}
