import { 
    Injectable,
    NotFoundException,
    ForbiddenException,
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

        return user;
    }
}

