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
        updates: { profile?: string; password?: string },
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

        const { profile, password } = updates;
        if (profile === undefined && password === undefined) {
            throw new BadRequestException('更新内容がありません');
        }

        if (profile !== undefined) {
            const trimmed = profile.trim();
            user.profile = trimmed === '' ? null : trimmed;
        }

        if (password !== undefined) {
            const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[A-Za-z\d]{8,}$/;
            if (!passwordRegex.test(password)) {
                throw new BadRequestException('パスワードは8文字以上で英数字の大文字・小文字を含めてください');
            }
            user.hash = createHash('md5').update(password).digest('hex');
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

