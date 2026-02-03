import { Controller, Get, Param, UseGuards, Request, Patch, Body, Query } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { UserService } from './user.service';

@Controller('users')
export class UserController {
    constructor(private userService: UserService) { }

    @UseGuards(AuthGuard('jwt'))
    @Get('me')
    async getMe(@Request() req: { user: { userId: string } }) {
        return this.userService.findById(req.user.userId);
    }

    @Get('leaderboard')
    async getLeaderboard(@Query('timeframe') timeframe: string = 'week') {
        return this.userService.getLeaderboard(timeframe);
    }

    @Get(':id/public-profile')
    async getPublicProfile(@Param('id') id: string) {
        return this.userService.getPublicProfile(id);
    }

    @UseGuards(AuthGuard('jwt'))
    @Patch('me')
    async updateProfile(
        @Request() req: { user: { userId: string } },
        @Body() body: { nickname?: string; avatarUrl?: string; isPublic?: boolean },
    ) {
        return this.userService.updateProfile(req.user.userId, body);
    }
}
