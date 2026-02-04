import { Controller, Post, Body } from '@nestjs/common';
import { IsEmail, IsString, MinLength, IsOptional } from 'class-validator';
import { WalletAuthService } from './wallet-auth.service';
import { EmailAuthService } from './email-auth.service';

class LoginDto {
    @IsEmail()
    email: string;

    @IsString()
    @MinLength(6)
    password: string;
}

class RegisterDto {
    @IsEmail()
    email: string;

    @IsString()
    @MinLength(6)
    password: string;

    @IsString()
    @IsOptional()
    nickname?: string;
}

@Controller('auth')
export class AuthController {
    constructor(
        private walletAuthService: WalletAuthService,
        private emailAuthService: EmailAuthService,
    ) { }

    @Post('login')
    async login(@Body() body: LoginDto) {
        return this.emailAuthService.login(body.email, body.password);
    }

    @Post('register')
    async register(@Body() body: RegisterDto) {
        return this.emailAuthService.register(body.email, body.password, body.nickname);
    }

    @Post('wallet/login')
    async walletLogin(@Body() body: { walletAddress: string; signature: string }) {
        return this.walletAuthService.loginWithWallet(body.walletAddress, body.signature);
    }
}

