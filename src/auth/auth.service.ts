import { Injectable, UnauthorizedException, BadRequestException, ConflictException} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Equal } from 'typeorm';
import { Auth } from '../entities/auth';
import { User } from '../entities/user.entity'; 
import * as crypto from 'crypto';

@Injectable()
export class AuthService {
    constructor(
        @InjectRepository(Auth)
        private readonly authRepository: Repository<Auth>,
        @InjectRepository(User)
        private readonly userRepository: Repository<User>,
    ) {}

    async register(name: string, email: string, password: string) {
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

        const hash = crypto.createHash('md5').update(password).digest('hex');
        const user = await this.userRepository.save({ name, email, hash });

        const expire = new Date();
        expire.setDate(expire.getDate() + 1);
        const token = crypto.randomUUID();

        const existingAuth = await this.authRepository.findOne({
            where: {
                user_id: Equal(user.id),
            },
        });

        if (existingAuth) {
            existingAuth.expire_at = expire;
            existingAuth.token = token;
            await this.authRepository.save(existingAuth);
        } else {
            await this.authRepository.save({
                user_id: user.id,
                token,
                expire_at: expire.toISOString(),
            });
        }

        return {
            token,
            user_id: user.id,
            name: user.name,
        };
    }

    async getAuth(name: string, password: string) {
        if (!name || !password) {
            throw new UnauthorizedException();
        }
        const hash = crypto.createHash('md5').update(password).digest('hex');
        
        const user = await this.userRepository.findOne({
            where: {
                name: Equal(name),
                hash: Equal(hash),
            },
            order: {
                id: 'DESC'
            }
        });

        if (!user) {
            throw new UnauthorizedException();
        }

        const ret = {
            token: '',
            user_id: user.id,
            name: user.name,
        };

        var expire = new Date();
        expire.setDate(expire.getDate() + 1);
        const auth = await this.authRepository.findOne({
            where: {
            user_id: Equal(user.id),
            },
        });

        if (auth) {
            auth.expire_at = expire;
            await this.authRepository.save(auth);
            ret.token = auth.token;
        }else{
            const token = crypto.randomUUID();
            const record = {
                user_id: user.id,
                token: token,
                expire_at: expire.toISOString(),
                };
            await this.authRepository.save(record);
            ret.token = token;
        }

        return ret;
    }
}
        
