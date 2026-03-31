import { Controller, Get, Post, Body, Query, Delete, Param, Headers } from '@nestjs/common';
import { PostService } from './post.service';

@Controller('post')
export class PostController {
    constructor(private readonly postService: PostService) {}

    @Post()
    async createPost(
        @Headers('authorization') authHeader: string,
        @Body('message') message: string,
    ) {
        const token = authHeader?.replace('Bearer ', '');
        return await this.postService.createPost(message, token);
    }

    @Get()
    async getList(
        @Headers('authorization') authHeader: string,
        @Query('start') start: number,
        @Query('records') records: number,
    ) {
        const token = authHeader?.replace('Bearer ', '');
        const startNum = Number(start) || 0;
        const recordsNum = Number(records) || 10;
        return await this.postService.getList(token, startNum, recordsNum);
    }

    @Get('search')
    async searchPosts(
        @Headers('authorization') authHeader: string,
        @Query('q') query: string,
        @Query('start') start: number = 0,
        @Query('records') records: number = 10,
    ) {
        const token = authHeader?.replace('Bearer ', '');
        const startNum = Number(start) || 0;
        const recordsNum = Number(records) || 10;
        return await this.postService.searchPosts(query, token, startNum, recordsNum);
    }

    @Delete(':id')
    async deletePost(
        @Headers('authorization') authHeader: string,
        @Param('id') id: string,
    ) {
        const token = authHeader?.replace('Bearer ', '');
        const postId = parseInt(id, 10);
        if (isNaN(postId)) {
            throw new Error('Invalid post ID');
        }
        return await this.postService.deletePost(postId, token);
    }
}
