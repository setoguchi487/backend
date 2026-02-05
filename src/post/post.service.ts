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

    async getList(token: string, start: number = 0, nr_records: number = 10) {
        const safeStart = Number.isFinite(start) ? Math.max(0, Math.floor(start)) : 0;
        const safeRecords = Number.isFinite(nr_records) ? Math.max(1, Math.floor(nr_records)) : 10;
        console.log('getList params:', { start, nr_records, safeStart, safeRecords });
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
        .leftJoin('user', 'user', 'user.id = micro_post.user_id')
        .select([
            'micro_post.id as id',
            'user.name as user_name',
            'micro_post.content as content',
            'micro_post.created_at as created_at',
        ])
        .orderBy('micro_post.created_at', 'DESC')
        .skip(safeStart)
        .take(safeRecords);
    
    type ResultType = {
        id: number;
        content: string;
        user_name: string;
        created_at: Date;
    };
    const records = await qb.getRawMany<ResultType>();
    console.log('getList records length:', records.length);
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

    async searchPosts(query: string, token: string, start: number = 0, nr_records: number = 10) {
        const safeStart = Number.isFinite(start) ? Math.max(0, Math.floor(start)) : 0;
        const safeRecords = Number.isFinite(nr_records) ? Math.max(1, Math.floor(nr_records)) : 10;
        console.log('=== searchPosts called ===');
        console.log('query:', query);
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

        // 総件数を取得
        const totalCount = await this.microPostsRepository
            .createQueryBuilder('micro_post')
            .where('micro_post.content LIKE :query', { query: `%${query}%` })
            .getCount();

        // 検索結果を取得
        const qb = await this.microPostsRepository
            .createQueryBuilder('micro_post')
            .leftJoin('user', 'user', 'user.id = micro_post.user_id')
            .select([
                'micro_post.id as id',
                'user.name as user_name',
                'micro_post.content as content',
                'micro_post.created_at as created_at',
            ])
            .where('micro_post.content LIKE :query', { query: `%${query}%` })
            .orderBy('micro_post.created_at', 'DESC')
            .skip(safeStart)
            .take(safeRecords);

        type ResultType = {
            id: number;
            content: string;
            user_name: string;
            created_at: Date;
        };
        const records = await qb.getRawMany<ResultType>();
        console.log('Search records:', records);
        console.log('=== searchPosts completed ===');
        return {
            posts: records,
            total: totalCount,
        };
    }

    async deletePost(postId: number, token: string) {
        console.log('=== deletePost called ===');
        console.log('postId:', postId, 'type:', typeof postId);
        console.log('token:', token);
        
        try {
            //ログイン済みか確認
            const now = new Date();
            const auth = await this.authRepository.findOne({
                where: {
                    token: Equal(token),
                    expire_at: MoreThan(now),
                },
            });
            if (!auth) {
                console.error('Auth not found or expired');
                throw new ForbiddenException('Invalid or expired token');
            }

            console.log('Auth validated, user_id:', auth.user_id);

            // 削除対象のポストを取得
            const post = await this.microPostsRepository.findOne({
                where: { id: postId },
            });
            
            console.log('Post found:', post);
            
            if (!post) {
                console.error('Post not found:', postId);
                throw new ForbiddenException('Post not found');
            }

            // 自分のポストか確認
            console.log('Checking ownership:', { post_user_id: post.user_id, auth_user_id: auth.user_id });
            if (post.user_id !== auth.user_id) {
                console.error('User does not own this post');
                throw new ForbiddenException('You can only delete your own posts');
            }

            console.log('Deleting post:', post);
            await this.microPostsRepository.remove(post);
            console.log('=== deletePost completed ===');
            return { success: true, message: 'Post deleted successfully' };
        } catch (error) {
            console.error('Error in deletePost:', error);
            throw error;
        }
    }
}
