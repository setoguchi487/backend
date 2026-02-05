import { Controller, Get, Post, Body, Query, Delete, Param } from '@nestjs/common';
import { PostService } from './post.service';

@Controller('post')
export class PostController {
    constructor(private readonly postService: PostService) {}

    @Post()
    async createPost(
        @Body('message') message: string,
        @Body('token') token: string,
    ) {
        return await this.postService.createPost(message, token);
    }

    @Get()
    async getList(
        @Query('token') token: string,
        @Query('start') start: number,
        @Query('records') records: number,
    ) {
        const startNum = Number(start) || 0;
        const recordsNum = Number(records) || 10;
        return await this.postService.getList(token, startNum, recordsNum);
    }

    @Get('search')
    async searchPosts(
        @Query('q') query: string,
        @Query('token') token: string,
        @Query('start') start: number = 0,
        @Query('records') records: number = 10,
    ) {
        const startNum = Number(start) || 0;
        const recordsNum = Number(records) || 10;
        return await this.postService.searchPosts(query, token, startNum, recordsNum);
    }
    async deletePost(
        @Param('id') id: string,
        @Query('token') token: string,
    ) {
        console.log('Delete controller - id param:', id, 'type:', typeof id);
        const postId = parseInt(id, 10);
        console.log('Parsed postId:', postId, 'isNaN:', isNaN(postId));
        if (isNaN(postId)) {
            console.error('Failed to parse id:', id);
            throw new Error('Invalid post ID');
        }
        return await this.postService.deletePost(postId, token);
    }
}
