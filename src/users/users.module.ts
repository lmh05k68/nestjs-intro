import { Module, forwardRef } from '@nestjs/common';
import { UsersController } from './users.controller';
import { UsersService } from './users.service'; 
import { User } from './user.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Profile } from '../profile/profile.entity';
import {PaginationModule} from '../common/pagination/pagination.module'
import { AuthModule } from 'src/auth/auth.module';
@Module({
  controllers: [UsersController],
  providers: [UsersService], 
  exports: [UsersService],
  imports: [
    TypeOrmModule.forFeature([User, Profile]),
    PaginationModule,
    forwardRef(() => AuthModule)
  ]
})
export class UsersModule {}