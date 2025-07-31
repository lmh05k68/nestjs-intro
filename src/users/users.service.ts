import {
  Injectable,
  ConflictException,
  NotFoundException,
  ServiceUnavailableException,
  InternalServerErrorException,
  Inject,
  forwardRef,
  RequestTimeoutException,
  UnauthorizedException,
} from '@nestjs/common';
import { Repository } from 'typeorm';
import { User } from './user.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { CreateUserDto } from './dtos/create-user.dto';
import { Profile } from '../profile/profile.entity';
import { ConfigService } from '@nestjs/config';
import { PaginationProvider, Paginated } from '../common/pagination/pagination.provider';
import { UserAlreadyExistsException } from 'src/CustomExceptions/user-already-exist.exception';
import { PaginationQueryDto } from 'src/common/pagination/dto/pagination-query.dto';
import { HashingProvider } from 'src/auth/provider/hashing.provider';
@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    private readonly configService: ConfigService,
    private readonly paginationProvider: PaginationProvider,

    @Inject(forwardRef(() => HashingProvider))
    private readonly hashingProvider: HashingProvider
  ) {}

  public async getAllUsers(
    paginationQueryDto: PaginationQueryDto,
  ): Promise<Paginated<User>> {
    try {
      return await this.paginationProvider.paginateQuery<User>(
        paginationQueryDto,
        this.userRepository,
        undefined,       
        ['profile'],   
      );
    } catch (error) {
      if (error.code === 'ECONNREFUSED') {
        throw new ServiceUnavailableException('Không thể kết nối tới cơ sở dữ liệu.');
      }
      throw new InternalServerErrorException('Đã có lỗi xảy ra khi lấy danh sách người dùng.');
    }
  }
  public async createUser(userDto: CreateUserDto): Promise<User> {
    try {
    const existingUser = await this.userRepository.findOne({
      where: [{ username: userDto.username }, { email: userDto.email }],
    });

    if (existingUser) {
      if (existingUser.username === userDto.username) {
        throw new UserAlreadyExistsException('username', userDto.username);
      }
      if (existingUser.email === userDto.email) {
        throw new UserAlreadyExistsException('email', userDto.email);
      }
    }
    
    
      let user = this.userRepository.create({
        ...userDto,
        password: await this.hashingProvider.hashPassword(userDto.password)
      });
      return await this.userRepository.save(user);
    } catch (error) {
      if (error.code === '23505') {
        throw new ConflictException('Email hoặc username đã tồn tại.');
      }
      if (error.code === 'ECONNREFUSED') {
        throw new ServiceUnavailableException('Không thể kết nối tới cơ sở dữ liệu.');
      }
      console.error('Lỗi không xác định khi tạo người dùng:', error);
      throw new InternalServerErrorException('Đã có lỗi không mong muốn xảy ra khi tạo người dùng.');
    }
  }

  public async deleteUser(id: number): Promise<{ deleted: boolean; message: string }> {
    return this.userRepository.manager.transaction(
      async (transactionalEntityManager) => {
        const user = await transactionalEntityManager.findOne(User, {
          where: { id },
          relations: { profile: true },
        });
        if (!user) {
          throw new NotFoundException(`Không tìm thấy người dùng với ID: ${id}`);
        }
        if (user.profile) {
          await transactionalEntityManager.softDelete(Profile, user.profile.id);
        }
        await transactionalEntityManager.softDelete(User, id);
        return {
          deleted: true,
          message: `Người dùng ${id} và profile liên quan đã được xóa mềm.`,
        };
      },
    );
  }

  public async FindUserById(id: number): Promise<User> {
    const user = await this.userRepository.findOne({
        where: { id },
        relations: { profile: true }
    });

    if (!user) {
      throw new NotFoundException(`Người dùng với ID ${id} không được tìm thấy.`);
    }

    return user;
  }

  public async findUserByUsername(username: string){
    let user: User | null = null;

    try{
      this.userRepository.findOneBy({
        username  
      })
    } catch(error){
        throw new RequestTimeoutException(error, {
          description: 'User with given username could not be found!'
        })
    }

    if(!user){
      throw new UnauthorizedException('User does not exist!');
    }

    return user;
  }
}