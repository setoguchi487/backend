import { Test, TestingModule } from '@nestjs/testing';
import { PostService } from './post.service';
import { ConfigModule } from '@nestjs/config';
import { PostController } from './post.controller';

describe('PostService', () => {
  let service: PostService;

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
      //providers: [PostService],
    }).compile();

    service = module.get<PostService>(PostService);
  });

  it('should be defined', async () => {
    const controller = new PostController(service);
    await controller.getList('xxx-xxx-xxx-xxx', 1, 10);
    expect(service.getList).toHaveBeenCalledTimes(1);
    //expect(service).toBeDefined();
  });
});
