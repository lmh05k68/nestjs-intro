import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Tweet } from './tweet.entity';
import { TweetController } from './tweet.controller';
import { TweetService } from './tweet.service';
import { UsersModule } from 'src/users/users.module'; // Giả sử bạn có UsersModule
import { HashtagModule } from 'src/hashtag/hashtag.module'; // THÊM MỚI
import { PaginationModule } from 'src/common/pagination/pagination.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Tweet]),
    UsersModule,  
    HashtagModule, 
    PaginationModule 
  ],
  controllers: [TweetController],
  providers: [TweetService],
})
export class TweetModule {}