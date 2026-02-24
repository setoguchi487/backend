import { 
    Injectable,
    NotFoundException,
    ForbiddenException,
    ConflictException,
    BadRequestException,
} from '@nestjs/common';
import { createHash } from 'crypto';
import { InjectRepository } from '@nestjs/typeorm';
import { Equal, MoreThan, Repository } from 'typeorm';
import { User } from '../entities/user.entity';
import { Auth } from '../entities/auth';

@Injectable()
export class UserService {
    constructor(
        @InjectRepository(User)
        private userRepository: Repository<User>,
        @InjectRepository(Auth)
        private authRepository: Repository<Auth>,
    ) {}

    async createUser(name: string, email:string, password:string) {
        if (!name || !email || !password) {
            throw new BadRequestException('名前、メール、パスワードは必須です');
        }

        const existingName = await this.userRepository.findOne({ where: { name: Equal(name) } });
        if (existingName) {
            throw new ConflictException('ユーザー名は既に使用されています');
        }

        const existingEmail = await this.userRepository.findOne({ where: { email: Equal(email) } });
        if (existingEmail) {
            throw new ConflictException('メールアドレスは既に登録されています');
        }

        const hash = createHash('md5').update(password).digest('hex');
        const record = {
            name: name,
            email:email,
            hash: hash,
        };
        await this.userRepository.save(record);
    }

    async getUser(token: string, id: number) {
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

        const user = await this.userRepository.findOne({
            where: {
                id: Equal(id),
            },
        });
        if (!user) {
            throw new NotFoundException('User not found');
        }
        return {
            id: user.id,
            name: user.name,
            email: user.email,
            birthday: user.birthday ?? null,
            profile: user.profile ?? null,
            created_at: user.created_at,
            updated_at: user.updated_at,
        };
    }

    async updateUser(
        token: string,
        id: number,
        updates: { profile?: string; birthday?: string },
    ) {
        if (!Number.isFinite(id)) {
            throw new BadRequestException('ユーザIDが不正です');
        }

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
        if (auth.user_id !== id) {
            throw new ForbiddenException('Not allowed to update other users');
        }

        const user = await this.userRepository.findOne({
            where: {
                id: Equal(id),
            },
        });
        if (!user) {
            throw new NotFoundException('User not found');
        }

        const { profile, birthday } = updates;
        if (profile === undefined && birthday === undefined) {
            throw new BadRequestException('更新内容がありません');
        }

        if (profile !== undefined) {
            const trimmed = profile.trim();
            user.profile = trimmed === '' ? undefined : trimmed;
        }

        if (birthday !== undefined) {
            user.birthday = birthday === '' ? undefined : new Date(birthday);
        }

        const updated = await this.userRepository.save(user);
        return {
            id: updated.id,
            name: updated.name,
            email: updated.email,
            birthday: updated.birthday ?? null,
            profile: updated.profile ?? null,
            created_at: updated.created_at,
            updated_at: updated.updated_at,
        };
    }
}

