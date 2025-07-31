import { PaginationQueryDto } from '../common/pagination/dto/pagination-query.dto';
import { BadRequestException, ConflictException, Injectable, NotFoundException, RequestTimeoutException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
// Sửa đổi import từ typeorm để lấy FindManyOptions
import { FindManyOptions, Repository } from 'typeorm';
import { UsersService } from 'src/users/users.service';
import { Tweet } from './tweet.entity';
import { CreateTweetDto } from './dto/create-tweet.dto';
import { HashtagService } from 'src/hashtag/hashtag.service';
import { Hashtag } from 'src/hashtag/hashtag.entity';
import { updateTweetDto } from './dto/update-tweet.dto';
import {
  PaginationProvider,
  Paginated,
} from 'src/common/pagination/pagination.provider';
import { User } from 'src/users/user.entity';

@Injectable()
export class TweetService {
  constructor(
    private readonly userService: UsersService,
    private readonly hashtagService: HashtagService,
    @InjectRepository(Tweet)
    private readonly tweetRepository: Repository<Tweet>,
    private readonly paginationProvider: PaginationProvider,
  ) {}

  public async getTweets(
  userId: number,
  pageQueryDto: PaginationQueryDto,
): Promise<Paginated<Tweet>> {
  // Relations
  const relations = ['user', 'hashtags'];
  // Where condition
  let where: any = undefined;
  if (userId) {
    where = { user: { id: userId } };
  }

  return this.paginationProvider.paginateQuery<Tweet>(
    pageQueryDto,
    this.tweetRepository,
    where,
    relations,
  );
}

  public async CreateTweet(createTweetDto: CreateTweetDto, userId: number): Promise<Tweet> {
    const user = await this.userService.FindUserById(userId);
    if (!user) {
      throw new NotFoundException(`Không thể tạo tweet, không tìm thấy người dùng với ID: ${userId}`);
    }
  
    let hashtagsToAssociate: Hashtag[] = [];
    if (createTweetDto.hashtags && createTweetDto.hashtags.length > 0) {
      hashtagsToAssociate = await this.hashtagService.findHashtags(createTweetDto.hashtags);
      if (hashtagsToAssociate.length !== createTweetDto.hashtags.length) {
        throw new BadRequestException('Một hoặc nhiều hashtag không tồn tại.');
      }
    }
  
    const newTweet = this.tweetRepository.create({
      ...createTweetDto,
      user,
      hashtags: hashtagsToAssociate,
    });
  
    return this.tweetRepository.save(newTweet);
  }

  public async updateTweet(updateTweetDto: updateTweetDto): Promise<Tweet> {
    const { id, text, image, hashtags: hashtagIds } = updateTweetDto;
    
    // Tối ưu: Dùng findOne để load tweet và các relations cần thiết.
    // Điều này hiệu quả hơn là dùng preload.
    const tweet = await this.tweetRepository.findOne({
        where: { id },
        relations: ['hashtags'],
    });

    if (!tweet) {
      throw new NotFoundException(`Không tìm thấy tweet với ID: ${id}`);
    }

    // Cập nhật các trường một cách có chọn lọc
    tweet.text = text ?? tweet.text;
    tweet.image = image ?? tweet.image;

    // Xử lý cập nhật hashtags một cách thông minh
    if (hashtagIds !== undefined) {
      if (hashtagIds.length > 0) {
        const foundHashtags = await this.hashtagService.findHashtags(hashtagIds);
        tweet.hashtags = foundHashtags;
      } else {
        // Nếu client gửi một mảng rỗng, có nghĩa là họ muốn xóa tất cả hashtags
        tweet.hashtags = [];
      }
    }
    
    return this.tweetRepository.save(tweet);
  }

  public async deleteTweet(
    id: number,
  ): Promise<{ deleted: boolean; id: number }> {
    const deleteResult = await this.tweetRepository.delete(id);
    if (deleteResult.affected === 0) {
      throw new NotFoundException(`Không tìm thấy tweet với ID: ${id} để xóa.`);
    }

    return { deleted: true, id };
  }
}