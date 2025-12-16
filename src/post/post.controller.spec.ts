import { Test, TestingModule } from '@nestjs/testing';
import { PostController } from './post.controller';
import { PostService } from './post.service';
import { ConfigModule } from '@nestjs/config';

describe('PostController', () => {
  let service: PostService; //差し替え用のサービス
  //let controller: PostController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [ConfigModule.forRoot()],
      providers: [
        {
          provide: PostService,
          useValue: {
            getList: jest.fn().mockReturnValue({}),
          },
        },
      ],
      //controllers: [PostController],
    }).compile();

    service = module.get<PostService>(PostService);
    //controller = module.get<PostController>(PostController);
  });

  it('should be defined', async () => {
    const controller = new PostController(service);
    await controller.getList('xxx-xxx-xxx-xxx', 0,10);
    expect(service.getList).toHaveBeenCalledTimes(1);
    //expect(controller).toBeDefined();
  });
});
