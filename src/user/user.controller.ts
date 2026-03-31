import { Controller, Get, Post, Param, Body, Patch, Headers } from '@nestjs/common';
import { UserService } from './user.service';

@Controller('user')
export class UserController {
    constructor(private readonly userService: UserService) {}

    @Post()
    async createUser(
        @Body('name') name: string,
        @Body('email') email: string,
        @Body('password') passward: string,
    ) {
        await this.userService.createUser(name, email, passward);
    }

    @Get(':id')
    async getUser(
        @Headers('authorization') authHeader: string,
        @Param('id') id: number,
    ) {
        const token = authHeader?.replace('Bearer ', '');
        return await this.userService.getUser(token, id);
    }

    @Patch(':id')
    async updateUser(
        @Headers('authorization') authHeader: string,
        @Param('id') id: string,
        @Body('profile') profile?: string,
        @Body('icon_url') icon_url?: string,
    ) {
        const token = authHeader?.replace('Bearer ', '');
        const userId = Number(id);
        return await this.userService.updateUser(token, userId, { profile, icon_url });
    }
}
