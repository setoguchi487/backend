import { Controller, Get, Post, Param, Query, Body } from '@nestjs/common';
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
    async getUser(@Param('id') id: number, @Query('token') token: string){
        return await this.userService.getUser(token, id);
    }
}
