import { Controller, Post, Get, Body, UseGuards, Request } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { IsEmail, IsString, MinLength } from 'class-validator';
import { AdminAuthService } from './admin-auth.service';

class AdminLoginDto {
    @IsEmail()
    email: string;

    @IsString()
    @MinLength(1)
    password: string;
}

@Controller('admin-auth')
export class AdminAuthController {
    constructor(private adminAuthService: AdminAuthService) { }

    @Post('login')
    async login(@Body() body: AdminLoginDto) {
        console.log('[AdminAuth] Login attempt:', { email: body.email, passwordLength: body.password?.length });
        try {
            const result = await this.adminAuthService.login(body.email, body.password);
            console.log('[AdminAuth] Login success for:', body.email);
            return result;
        } catch (error) {
            console.error('[AdminAuth] Login error:', error);
            throw error;
        }
    }

    @Get('me')
    @UseGuards(AuthGuard('jwt'))
    async getMe(@Request() req: { user: { sub: string; isAdmin: boolean } }) {
        if (!req.user.isAdmin) {
            return { error: 'Not an admin' };
        }
        return this.adminAuthService.getAdminById(req.user.sub);
    }
}
