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
            'user.id as user_id',
            'user.name as user_name',
            'micro_post.content as content',
            'micro_post.created_at as created_at',
        ])
        .orderBy('micro_post.created_at', 'DESC')
        .skip(safeStart)
        .take(safeRecords);
    
    type ResultType = {
        id: number;
        user_id: number;
        content: string;
        user_name: string;
        created_at: Date;
    };
    const records = await qb.getRawMany<ResultType>();
    return {
        posts: records,
        total: totalCount,
    };

    }

    async createPost(message: string, token: string) {
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

        const record = {
            user_id: auth.user_id,
            content: message,
        };
        await this.microPostsRepository.save(record);
    }

    async searchPosts(query: string, token: string, start: number = 0, nr_records: number = 10) {
        const safeStart = Number.isFinite(start) ? Math.max(0, Math.floor(start)) : 0;
        const safeRecords = Number.isFinite(nr_records) ? Math.max(1, Math.floor(nr_records)) : 10;
        
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
                'user.id as user_id',
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
            user_id: number;
            content: string;
            user_name: string;
            created_at: Date;
        };
        const records = await qb.getRawMany<ResultType>();
        return {
            posts: records,
            total: totalCount,
        };
    }

    async deletePost(postId: number, token: string) {
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
                throw new ForbiddenException('Invalid or expired token');
            }

            // 削除対象のポストを取得
            const post = await this.microPostsRepository.findOne({
                where: { id: postId },
            });
            
            if (!post) {
                throw new ForbiddenException('Post not found');
            }

            // 自分のポストか確認
            if (post.user_id !== auth.user_id) {
                throw new ForbiddenException('You can only delete your own posts');
            }

            await this.microPostsRepository.remove(post);
            return { success: true, message: 'Post deleted successfully' };
        } catch (error) {
            throw error;
        }
    }
}

