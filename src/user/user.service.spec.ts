import { Test, TestingModule } from '@nestjs/testing';
import { UserService } from './user.service';
import { ConfigModule } from '@nestjs/config';
import { UserController } from './user.controller';

describe('UserService', () => {
  let service: UserService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [ConfigModule.forRoot()],
      providers: [
        {
          provide: UserService,
          useValue: {
            getUser: jest.fn().mockReturnValue({}),
          },
        },
      ],
      //providers: [UserService],
    }).compile();

    service = module.get<UserService>(UserService);
  });

  it('should be defined', async () => {
    const controller = new UserController(service);
    await controller.getUser(1, 'xxx-xxx-xxx-xxx');
    expect(service.getUser).toHaveBeenCalledTimes(1);
    //expect(service).toBeDefined();
  });
});
