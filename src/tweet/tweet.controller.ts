// src/tweet/tweet.controller.ts

// SỬA ĐỔI: Thêm Optional và ParseIntPipe vào danh sách import
import { Controller, Param, Get, Post, Body, Patch, Delete, Query, Optional, ParseIntPipe } from "@nestjs/common";
import { TweetService } from "./tweet.service";
import { CreateTweetDto } from "./dto/create-tweet.dto";  
import { updateTweetDto } from "./dto/update-tweet.dto";
import { PaginationQueryDto } from "src/common/pagination/dto/pagination-query.dto";
import { ActiveUser } from "src/auth/decorators/active-user.decorator";

@Controller('tweet')
export class TweetController {
  constructor(private tweetService: TweetService) {}

  // ====================================================================
  // SỬA LỖI: Chuyển userid từ path parameter thành query parameter
  // ====================================================================
  
  // URL mới sẽ là:
  // - Lấy tất cả tweet: http://localhost:3000/tweet?limit=10&page=3
  // - Lấy tweet theo user: http://localhost:3000/tweet?userid=101&limit=10&page=3
  
  @Get() // Bỏ hoàn toàn ':userid?' ra khỏi đây
  public GetTweets(
    // Sử dụng @Query() để lấy userid từ chuỗi truy vấn.
    // @Optional() cho phép userid có thể không tồn tại.
    // ParseIntPipe sẽ validate và chuyển đổi nếu userid được cung cấp.
    @Optional() @Query('userid', new ParseIntPipe({ optional: true })) userid: number, 
    @Query() paginationQueryDto: PaginationQueryDto
  ) {
    console.log(`Querying tweets. UserID (optional): ${userid}`);
    console.log(paginationQueryDto);
    // Phương thức service không cần thay đổi gì cả. Nó đã xử lý trường hợp userid là null/undefined.
    return this.tweetService.getTweets(userid, paginationQueryDto);
  }

  // ====================================================================
  // Các phương thức khác giữ nguyên hoàn toàn
  // ====================================================================

  @Post()
  public CreateTweet(@Body() tweet: CreateTweetDto, @ActiveUser('sub') userId: number) {
    return this.tweetService.CreateTweet(tweet, userId);
  }

  @Patch()
  public UpdateTweet(@Body() tweet: updateTweetDto) {
    return this.tweetService.updateTweet(tweet);
  }

  @Delete(':id')
  public DeleteTweet(@Param('id', ParseIntPipe) id: number) {
    return this.tweetService.deleteTweet(id);
  }
}