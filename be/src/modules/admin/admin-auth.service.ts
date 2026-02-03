import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../../infrastructure/database/prisma.service';
import * as bcrypt from 'bcryptjs';

@Injectable()
export class AdminAuthService {
    constructor(
        private prisma: PrismaService,
        private jwtService: JwtService,
    ) { }

    async validateAdmin(email: string, password: string) {
        const admin = await this.prisma.adminUser.findUnique({
            where: { email },
        });

        if (!admin) {
            throw new UnauthorizedException('Email hoặc mật khẩu không đúng');
        }

        const isPasswordValid = await bcrypt.compare(password, admin.passwordHash);
        if (!isPasswordValid) {
            throw new UnauthorizedException('Email hoặc mật khẩu không đúng');
        }

        return admin;
    }

    async login(email: string, password: string) {
        const admin = await this.validateAdmin(email, password);

        const payload = {
            sub: admin.id,
            email: admin.email,
            role: admin.role,
            isAdmin: true,
        };

        return {
            access_token: this.jwtService.sign(payload),
            admin: {
                id: admin.id,
                email: admin.email,
                role: admin.role,
            },
        };
    }

    async getAdminById(id: string) {
        return this.prisma.adminUser.findUnique({
            where: { id },
            select: {
                id: true,
                email: true,
                role: true,
                createdAt: true,
            },
        });
    }

    async createAdmin(email: string, password: string, role: string = 'admin') {
        const hashedPassword = await bcrypt.hash(password, 10);

        return this.prisma.adminUser.create({
            data: {
                email,
                passwordHash: hashedPassword,
                role,
            },
            select: {
                id: true,
                email: true,
                role: true,
                createdAt: true,
            },
        });
    }
}
