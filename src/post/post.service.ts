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
    return records;

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
}
