import { Injectable, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Equal, MoreThan } from 'typeorm';
import { MicroPost } from '../entities/microposts';
import { Auth } from '../entities/auth';

@Injectable()
export class PostService {
    constructor(
        @InjectRepository(MicroPost)
        private microPostsRepository: Repository<MicroPost>,
        @InjectRepository(Auth)
        private authRepository: Repository<Auth>,
    ) {}

    async getList(token: string, start: number = 0, nr_records: number = 1) {
        //ログイン済みか確認
        const now = new Date();
        const auth = await this.authRepository.findOne({
            where: {
                token: Equal(token),
                expire_at: MoreThan(now),
            },
        });
        if (!auth) {
            throw new ForbiddenException('Invalid or expired token');
        }

        // 総件数を取得
        const totalCount = await this.microPostsRepository
            .createQueryBuilder('micro_post')
            .getCount();

        const qb = await this.microPostsRepository
        .createQueryBuilder('micro_post')
        .leftJoinAndSelect('user', 'user', 'user_id = micro_post.user_id')
        .select([
            'micro_post.id',
            'user.name as user_name',
            'micro_post.content as content',
            'micro_post.created_at as created_at',
        ])
        .orderBy('micro_post.created_at', 'DESC')
        .offset(start)
        .limit(nr_records);
    
    type ResultType = {
        id: number;
        content: string;
        user_name: string;
        created_at: Date;
    };
    const records = await qb.getRawMany<ResultType>();
    console.log(records);
    return {
        posts: records,
        total: totalCount,
    };

    }

    async createPost(message: string, token: string) {
        console.log('=== createPost called ===');
        console.log('message:', message);
        console.log('token:', token);
        
        //ログイン済みか確認
        const now = new Date();
        const auth = await this.authRepository.findOne({
            where: {
                token: Equal(token),
                expire_at: MoreThan(now),
            },
        });
        if (!auth) {
            throw new ForbiddenException('Invalid or expired token');
        }

        console.log('auth.user_id:', auth.user_id);
        
        const record = {
            user_id: auth.user_id,
            content: message,
        };
        console.log('Saving record:', record);
        await this.microPostsRepository.save(record);
        console.log('=== createPost completed ===');
    }

    async deletePost(postId: number, token: string) {
        console.log('=== deletePost called ===');
        console.log('postId:', postId);
        console.log('token:', token);
        
        //ログイン済みか確認
        const now = new Date();
        const auth = await this.authRepository.findOne({
            where: {
                token: Equal(token),
                expire_at: MoreThan(now),
            },
        });
        if (!auth) {
            throw new ForbiddenException('Invalid or expired token');
        }

        // 削除対象のポストを取得
        const post = await this.microPostsRepository.findOne({
            where: { id: Equal(postId) },
        });
        
        if (!post) {
            throw new ForbiddenException('Post not found');
        }

        // 自分のポストか確認
        if (post.user_id !== auth.user_id) {
            throw new ForbiddenException('You can only delete your own posts');
        }

        console.log('Deleting post:', post);
        await this.microPostsRepository.remove(post);
        console.log('=== deletePost completed ===');
    }
}
