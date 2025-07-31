import {
  Controller,
  Get,
  Param,
  Delete,
  ParseIntPipe,
  Query
} from '@nestjs/common';
import { UsersService } from './users.service';
import { PaginationQueryDto } from 'src/common/pagination/dto/pagination-query.dto';

@Controller('users')
//@UseGuards(AuthorizeGuard)
export class UsersController {
  constructor(private usersService: UsersService) {}

  @Get()
  getUsers(@Query() pageQueryDto: PaginationQueryDto) { 
    return this.usersService.getAllUsers(pageQueryDto);
  }

  @Get()
  getUsersbyId(@Param('id', ParseIntPipe) id: number) { 
    return this.usersService.FindUserById(id);
  }

  // @Post()
  // createUser(@Body() user: CreateUserDto) { 
  //   return this.usersService.createUser(user);
  // }

  @Delete(':id')
  deleteUser(@Param('id', ParseIntPipe) id: number) { 
    return this.usersService.deleteUser(id); 
  }
}