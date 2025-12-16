import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { ConfigModule } from '@nestjs/config';
import { AuthController } from './auth.controller';
import { User } from 'src/entities/user.entity';

describe('AuthService', () => {
  let service: AuthService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [ConfigModule.forRoot()],
      providers: [
        {
          provide: AuthService,
          useValue: {
            getAuth: jest.fn().mockReturnValue({}),
          },
        },
      ],
      //providers: [AuthService],
    }).compile();

    service = module.get<AuthService>(AuthService);
  });

  it('should be defined', async () => {
    const controller = new AuthController(service);
    await controller.getAuth('1', 'xxx-xxx-xxx-xxx');
    expect(service.getAuth).toHaveBeenCalledTimes(1);
    //expect(service).toBeDefined();
  });
});
