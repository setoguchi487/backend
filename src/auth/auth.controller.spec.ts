import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { ConfigModule } from '@nestjs/config';

describe('AuthController', () => {
  let service: AuthService; 
  //let controller: AuthController;

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
      //controllers: [AuthController],
    }).compile();

    service = module.get<AuthService>(AuthService);
  });

  it('should be defined', async () => {
    const controller = new AuthController(service);
    await controller.getAuth('1', 'xxx-xxx-xxx-xxx');
    expect(service.getAuth).toHaveBeenCalledTimes(1);
    //expect(controller).toBeDefined();
  });
});
