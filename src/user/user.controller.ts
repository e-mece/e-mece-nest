import {
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  UseGuards,
  Body,
  Put,
  ParseIntPipe,
  Param,
  UnauthorizedException,
} from '@nestjs/common';
import { UserService } from './user.service';
import { ApiUseTags, ApiBearerAuth } from '@nestjs/swagger';
import { GetLeaderboardResponse, UpdateUserRequest } from '../contract';
import { AuthGuard } from '@nestjs/passport';
import { Usr } from './user.decorator';
import { updateUserEntityFromModel } from './user.mapper';
import { User } from './user.entity';

@ApiUseTags('user')
@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get('leaderboard')
  @HttpCode(HttpStatus.OK)
  async getTopUsers(): Promise<GetLeaderboardResponse> {
    return await this.userService.getLeaderBoard(20);
  }

  @ApiBearerAuth()
  @Put(':id')
  @HttpCode(HttpStatus.OK)
  @UseGuards(AuthGuard())
  async updateUser(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateRequest: UpdateUserRequest,
    @Usr() user: User,
  ) {
    if (id !== user.id || id !== updateRequest.user.id) {
      throw new UnauthorizedException();
    }
    const newUser = user;
    updateUserEntityFromModel(newUser, updateRequest.user);
    await this.userService.updateUser(newUser);
  }
}
