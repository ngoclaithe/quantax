import { Injectable, UnauthorizedException, ConflictException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../../infrastructure/database/prisma.service';
import * as bcrypt from 'bcryptjs';

@Injectable()
export class EmailAuthService {
    constructor(
        private prisma: PrismaService,
        private jwtService: JwtService,
    ) { }

    async register(email: string, password: string, nickname?: string) {
        // Check if user exists
        const existingUser = await this.prisma.user.findUnique({
            where: { email },
        });

        if (existingUser) {
            throw new ConflictException('Email đã được sử dụng');
        }

        // Hash password
        const passwordHash = await bcrypt.hash(password, 10);

        // Create user
        const user = await this.prisma.user.create({
            data: {
                email,
                passwordHash,
                nickname: nickname || email.split('@')[0],
                role: 'USER',
                wallet: {
                    create: {
                        balance: 1000, // Give demo balance
                        lockedBalance: 0,
                    },
                },
            },
            include: {
                wallet: true,
            },
        });

        // Generate JWT
        const payload = { sub: user.id, email: user.email, role: user.role };
        const accessToken = this.jwtService.sign(payload);

        return {
            accessToken,
            user: {
                id: user.id,
                email: user.email,
                nickname: user.nickname,
                role: user.role,
                balance: user.wallet?.balance || 0,
            },
        };
    }

    async login(email: string, password: string) {
        // Find user
        const user = await this.prisma.user.findUnique({
            where: { email },
            include: {
                wallet: true,
            },
        });

        if (!user) {
            throw new UnauthorizedException('Email hoặc mật khẩu không đúng');
        }

        // Check password
        if (!user.passwordHash) {
            throw new UnauthorizedException('Tài khoản không sử dụng mật khẩu');
        }

        const isPasswordValid = await bcrypt.compare(password, user.passwordHash);
        if (!isPasswordValid) {
            throw new UnauthorizedException('Email hoặc mật khẩu không đúng');
        }

        // Generate JWT
        const payload = { sub: user.id, email: user.email, role: user.role };
        const accessToken = this.jwtService.sign(payload);

        return {
            accessToken,
            user: {
                id: user.id,
                email: user.email,
                nickname: user.nickname,
                role: user.role,
                balance: user.wallet?.balance || 0,
            },
        };
    }
}
