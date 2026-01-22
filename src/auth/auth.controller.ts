import { Controller, Get, Post, Body, Query } from '@nestjs/common';
import { AuthService } from './auth.service';

@Controller('auth')
export class AuthController {
    constructor(private readonly authService: AuthService) {}

    @Get()
    async getAuth(
        @Query('user_id') name: string,
        @Query('password') password: string,
    ) {
        return this.authService.getAuth(name, password);
    }

    @Post('register')
    async register(
        @Body('name') name: string,
        @Body('email') email: string,
        @Body('password') password: string,
    ) {
        return this.authService.register(name, email, password);
    }
        
}
